from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    avatar = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=10, choices=[('user', 'User'), ('admin', 'Admin')], default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_sign_in_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username or self.email or f"User {self.id}"


CATEGORY_CHOICES = [
    ('healing', 'Healing'),
    ('finance', 'Finance'),
    ('family', 'Family'),
    ('career', 'Career'),
    ('deliverance', 'Deliverance'),
    ('general', 'General'),
]

TYPE_CHOICES = [
    ('text', 'Text'),
    ('video', 'Video'),
    ('audio', 'Audio'),
]

STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('declined', 'Declined'),
]

URGENCY_CHOICES = [
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high', 'High'),
]

PRAYER_STATUS_CHOICES = [
    ('active', 'Active'),
    ('answered', 'Answered'),
]

FORUM_CATEGORY_CHOICES = [
    ('faith', 'Faith & Encouragement'),
    ('life', 'Life Challenges'),
    ('relationships', 'Relationships'),
    ('career_forum', 'Career & Purpose'),
    ('prayer', 'Prayer Requests'),
    ('general', 'General'),
]


class Testimony(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='testimonies')
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='text')
    media_url = models.URLField(blank=True, null=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    is_anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    prayer_count = models.IntegerField(default=0)
    amen_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'testimonies'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Prayer(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='prayers')
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='low')
    is_anonymous = models.BooleanField(default=True)
    status = models.CharField(max_length=10, choices=PRAYER_STATUS_CHOICES, default='active')
    prayer_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    answered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'prayers'
        ordering = ['-created_at']

    def __str__(self):
        return self.content[:50]


class PrayerResponse(models.Model):
    prayer = models.ForeignKey(Prayer, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prayer_responses'
        unique_together = ['prayer', 'user']


class Comment(models.Model):
    TARGET_CHOICES = [
        ('testimony', 'Testimony'),
        ('prayer', 'Prayer'),
    ]
    target_type = models.CharField(max_length=10, choices=TARGET_CHOICES)
    target_id = models.PositiveIntegerField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comments'
        ordering = ['-created_at']


class SavedItem(models.Model):
    ITEM_CHOICES = [
        ('testimony', 'Testimony'),
        ('prayer', 'Prayer'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item_type = models.CharField(max_length=10, choices=ITEM_CHOICES)
    item_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_items'
        unique_together = ['user', 'item_type', 'item_id']


class PrayerCircle(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='circles_owned')
    member_count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prayer_circles'
        ordering = ['-member_count']

    def __str__(self):
        return self.name


class CircleMember(models.Model):
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('moderator', 'Moderator'),
    ]
    circle = models.ForeignKey(PrayerCircle, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'circle_members'
        unique_together = ['circle', 'user']


class ScheduledPrayer(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    host = models.ForeignKey(User, on_delete=models.CASCADE)
    circle = models.ForeignKey(PrayerCircle, on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_at = models.DateTimeField()
    duration = models.IntegerField(default=60)
    is_live = models.BooleanField(default=False)
    participant_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scheduled_prayers'
        ordering = ['scheduled_at']

    def __str__(self):
        return self.title


class ForumTopic(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=FORUM_CATEGORY_CHOICES)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reply_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'forum_topics'
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title


class ForumReply(models.Model):
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'forum_replies'
        ordering = ['created_at']
