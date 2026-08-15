from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import api_login, api_logout, api_register, api_google_auth

router = DefaultRouter()
router.register(r'testimonies', views.TestimonyViewSet, basename='testimony')
router.register(r'prayers', views.PrayerViewSet, basename='prayer')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'circles', views.PrayerCircleViewSet, basename='circle')
router.register(r'schedules', views.ScheduledPrayerViewSet, basename='schedule')
router.register(r'forum', views.ForumTopicViewSet, basename='forum')
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'slides', views.SlideViewSet, basename='slide')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/csrf/', views.api_csrf_token, name='api_csrf_token'),
    path('auth/login/', api_login, name='api_login'),
    path('auth/register/', api_register, name='api_register'),
    path('auth/logout/', api_logout, name='api_logout'),
    path('auth/google/', api_google_auth, name='api_google_auth'),
    path('auth/me/', views.UserViewSet.as_view({'get': 'me'}), name='auth_me'),
    path('admin/stats/', views.AdminViewSet.as_view({'get': 'list_stats'}), name='admin_stats'),
    path('admin/users/', views.AdminViewSet.as_view({'get': 'list_users'}), name='admin_users'),
    path('admin/upload/', views.api_upload, name='admin_upload'),
    path('users/upload/', views.api_user_upload, name='user_upload'),
    path('testimonies/upload/', views.api_testimony_media_upload, name='testimony_upload'),
    path('prayers/answered/', views.PrayerViewSet.as_view({'get': 'answered'}), name='prayers_answered'),
]
