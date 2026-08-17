from rest_framework import serializers
from .models import (
    User, Testimony, TestimonyReaction, Prayer, PrayerResponse, Comment,
    PrayerCircle, CircleMember, ScheduledPrayer, ForumTopic, ForumReply,
    CircleMessage, Slide, LiveRoomMessage, LiveRoomParticipant, LiveRoomReaction
)


from django.conf import settings


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'bio', 'role', 'subscription_plan', 'created_at', 'last_sign_in_at']

    def get_avatar(self, obj):
        if not obj.avatar:
            return None
        url = str(obj.avatar).strip()
        if not url:
            return None
        request = self.context.get('request')
        if url.startswith('/') and request:
            url = request.build_absolute_uri(url)
        if not settings.DEBUG and url.startswith('http://') and not ('localhost' in url or '127.0.0.1' in url):
            url = 'https://' + url[7:]
        return url


class AuthorField(serializers.Field):
    def to_representation(self, value):
        if value is None:
            return None
        avatar = value.avatar
        if avatar:
            avatar = str(avatar).strip()
            if not settings.DEBUG and avatar.startswith('http://') and not ('localhost' in avatar or '127.0.0.1' in avatar):
                avatar = 'https://' + avatar[7:]
        return {
            'id': value.id,
            'name': value.get_full_name() or value.username or 'User',
            'avatar': avatar or None,
        }


class TestimonyListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    has_reacted = serializers.SerializerMethodField()

    class Meta:
        model = Testimony
        fields = ['id', 'title', 'content', 'category', 'type', 'media_url', 'thumbnail_url',
                  'is_anonymous', 'status', 'prayer_count', 'amen_count', 'view_count',
                  'created_at', 'user_id', 'author_name', 'author_avatar', 'has_reacted']

    def get_author_name(self, obj):
        if obj.is_anonymous or obj.user is None:
            return None
        return obj.user.get_full_name() or obj.user.username or 'User'

    def get_author_avatar(self, obj):
        if obj.is_anonymous or obj.user is None:
            return None
        return obj.user.avatar

    def get_has_reacted(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return TestimonyReaction.objects.filter(testimony=obj, user=request.user).exists()
        return False


class TestimonyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimony
        fields = ['title', 'content', 'category', 'type', 'media_url', 'thumbnail_url', 'is_anonymous']


class PrayerListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Prayer
        fields = ['id', 'content', 'category', 'urgency', 'is_anonymous', 'status',
                  'prayer_count', 'created_at', 'answered_at', 'user_id', 'author_name', 'author_avatar']

    def get_author_name(self, obj):
        if obj.is_anonymous or obj.user is None:
            return None
        return obj.user.get_full_name() or obj.user.username or 'User'

    def get_author_avatar(self, obj):
        if obj.is_anonymous or obj.user is None:
            return None
        return obj.user.avatar


class PrayerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prayer
        fields = ['content', 'category', 'urgency', 'is_anonymous']


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'target_type', 'target_id', 'content', 'is_anonymous', 'created_at', 'user_id', 'author_name']

    def get_author_name(self, obj):
        if obj.is_anonymous or obj.user is None:
            return None
        return obj.user.get_full_name() or obj.user.username or 'User'


class PrayerCircleSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = PrayerCircle
        fields = ['id', 'name', 'description', 'category', 'is_public', 'member_count',
                  'created_at', 'created_by', 'owner_name']

    def get_owner_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username or 'User'
        return None


class ScheduledPrayerSerializer(serializers.ModelSerializer):
    host_name = serializers.SerializerMethodField()

    class Meta:
        model = ScheduledPrayer
        fields = ['id', 'title', 'description', 'scheduled_at', 'duration', 'is_live', 'stream_url',
                  'participant_count', 'created_at', 'host_id', 'host_name']

    def get_host_name(self, obj):
        if obj.host:
            return obj.host.get_full_name() or obj.host.username or 'User'
        return None


class ForumTopicSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()

    class Meta:
        model = ForumTopic
        fields = ['id', 'title', 'content', 'category', 'reply_count', 'view_count',
                  'is_pinned', 'created_at', 'updated_at', 'user_id', 'author_name', 'author_avatar']

    def get_author_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username or 'User'
        return None

    def get_author_avatar(self, obj):
        if obj.user:
            return obj.user.avatar
        return None


class ForumReplySerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = ForumReply
        fields = ['id', 'content', 'created_at', 'user_id', 'author_name']

    def get_author_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username or 'User'
        return None


class CircleMessageSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    user_reactions = serializers.SerializerMethodField()

    class Meta:
        model = CircleMessage
        fields = ['id', 'content', 'image', 'created_at', 'user_id', 'author_name', 'author_avatar', 'reactions', 'user_reactions']

    def get_author_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username or 'User'
        return None

    def get_author_avatar(self, obj):
        if obj.user:
            return obj.user.avatar
        return None

    def get_reactions(self, obj):
        from .models import CircleMessageReaction
        from django.db.models import Count
        counts = CircleMessageReaction.objects.filter(message=obj).values('reaction_type').annotate(count=Count('id'))
        return {item['reaction_type']: item['count'] for item in counts}

    def get_user_reactions(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return []
        from .models import CircleMessageReaction
        return list(CircleMessageReaction.objects.filter(message=obj, user=request.user).values_list('reaction_type', flat=True))


class CircleMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = CircleMember
        fields = ['id', 'role', 'joined_at', 'user_id', 'user_name', 'user_avatar']

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username or 'User'
        return None

    def get_user_avatar(self, obj):
        if obj.user:
            return obj.user.avatar
        return None


class SlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slide
        fields = '__all__'


class LiveRoomMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = LiveRoomMessage
        fields = ['id', 'text', 'created_at', 'user_id', 'user_name', 'user_avatar']

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username or 'User'
        return None

    def get_user_avatar(self, obj):
        if obj.user:
            return obj.user.avatar
        return None


class LiveRoomParticipantSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = LiveRoomParticipant
        fields = ['id', 'user_id', 'name', 'avatar', 'is_co_moderator', 'peer_id']

    def get_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username or 'User'
        return None

    def get_avatar(self, obj):
        if obj.user:
            return obj.user.avatar
        return None


class LiveRoomReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveRoomReaction
        fields = ['id', 'emoji', 'label', 'created_at']
