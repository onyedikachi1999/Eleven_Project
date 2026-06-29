from rest_framework import serializers
from .models import (
    User, Testimony, TestimonyReaction, Prayer, PrayerResponse, Comment,
    PrayerCircle, CircleMember, ScheduledPrayer, ForumTopic, ForumReply
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'bio', 'role', 'created_at', 'last_sign_in_at']


class AuthorField(serializers.Field):
    def to_representation(self, value):
        if value is None:
            return None
        return {
            'id': value.id,
            'name': value.get_full_name() or value.username or 'User',
            'avatar': value.avatar,
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
        fields = ['id', 'title', 'description', 'scheduled_at', 'duration', 'is_live',
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
