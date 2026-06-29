from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Testimony, Prayer, PrayerResponse, Comment,
    PrayerCircle, CircleMember, ScheduledPrayer, ForumTopic, ForumReply
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'created_at', 'last_sign_in_at']
    list_filter = ['role', 'created_at']
    fieldsets = UserAdmin.fieldsets + (
        ('Custom', {'fields': ('avatar', 'bio', 'role')}),
    )


@admin.register(Testimony)
class TestimonyAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'type', 'status', 'amen_count', 'created_at']
    list_filter = ['category', 'type', 'status']
    search_fields = ['title', 'content']


@admin.register(Prayer)
class PrayerAdmin(admin.ModelAdmin):
    list_display = ['content_preview', 'category', 'urgency', 'status', 'prayer_count', 'created_at']
    list_filter = ['category', 'urgency', 'status']

    def content_preview(self, obj):
        return obj.content[:60]
    content_preview.short_description = 'Content'


@admin.register(PrayerCircle)
class PrayerCircleAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'member_count', 'is_public', 'created_at']


@admin.register(ScheduledPrayer)
class ScheduledPrayerAdmin(admin.ModelAdmin):
    list_display = ['title', 'scheduled_at', 'is_live', 'participant_count']


@admin.register(ForumTopic)
class ForumTopicAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'reply_count', 'view_count', 'is_pinned', 'created_at']


admin.site.register(PrayerResponse)
admin.site.register(Comment)
admin.site.register(CircleMember)
admin.site.register(ForumReply)
