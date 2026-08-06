import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.cache import cache
from django.middleware.csrf import get_token
from django.db.models import Q, Count
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import (
    User, Testimony, Prayer, PrayerResponse, Comment,
    PrayerCircle, CircleMember, ScheduledPrayer, ForumTopic, ForumReply,
    Slide
)
from .serializers import (
    UserSerializer, TestimonyListSerializer, TestimonyCreateSerializer,
    PrayerListSerializer, PrayerCreateSerializer, CommentSerializer,
    PrayerCircleSerializer, ScheduledPrayerSerializer,
    ForumTopicSerializer, ForumReplySerializer, SlideSerializer
)


class TestimonyViewSet(viewsets.ModelViewSet):
    queryset = Testimony.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TestimonyCreateSerializer
        return TestimonyListSerializer

    def get_queryset(self):
        qs = Testimony.objects.all()
        category = self.request.query_params.get('category')
        ttype = self.request.query_params.get('type')
        sort = self.request.query_params.get('sort', 'recent')
        status_filter = self.request.query_params.get('status')

        if category:
            qs = qs.filter(category=category)
        if ttype:
            qs = qs.filter(type=ttype)
        if status_filter:
            qs = qs.filter(status=status_filter)
        else:
            qs = qs.filter(status='approved')

        if sort == 'popular':
            qs = qs.order_by('-view_count')
        elif sort == 'mostPrayed':
            qs = qs.order_by('-prayer_count')
        else:
            qs = qs.order_by('-created_at')
        return qs

    def create(self, request):
        serializer = TestimonyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        testimony = serializer.save(user=request.user if request.user.is_authenticated else None)
        return Response(TestimonyListSerializer(testimony).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def amen(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        t = self.get_object()
        from .models import TestimonyReaction
        reaction, created = TestimonyReaction.objects.get_or_create(testimony=t, user=request.user)
        if not created:
            reaction.delete()
            if t.amen_count > 0:
                t.amen_count -= 1
            t.save()
            return Response({'reacted': False, 'amen_count': t.amen_count})
        else:
            t.amen_count += 1
            t.save()
            return Response({'reacted': True, 'amen_count': t.amen_count})

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        t = self.get_object()
        t.view_count += 1
        t.save()
        return Response({'view_count': t.view_count})

    @action(detail=False, methods=['get'])
    def pending(self, request):
        if not (request.user.is_authenticated and request.user.role == 'admin'):
            return Response({'detail': 'Forbidden'}, status=403)
        qs = Testimony.objects.filter(status='pending').order_by('-created_at')
        serializer = TestimonyListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if not (request.user.is_authenticated and request.user.role == 'admin'):
            return Response({'detail': 'Forbidden'}, status=403)
        t = self.get_object()
        t.status = 'approved'
        t.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        if not (request.user.is_authenticated and request.user.role == 'admin'):
            return Response({'detail': 'Forbidden'}, status=403)
        t = self.get_object()
        t.status = 'declined'
        t.save()
        return Response({'status': 'declined'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Testimony.objects.filter(status='approved').count()
        return Response({'total': total})


class PrayerViewSet(viewsets.ModelViewSet):
    queryset = Prayer.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return PrayerCreateSerializer
        return PrayerListSerializer

    def get_queryset(self):
        qs = Prayer.objects.all()
        category = self.request.query_params.get('category')
        prayer_status = self.request.query_params.get('prayer_status', 'active')

        if category:
            qs = qs.filter(category=category)
        qs = qs.filter(status=prayer_status)
        return qs.order_by('-created_at')

    def create(self, request):
        serializer = PrayerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        prayer = serializer.save(user=request.user if request.user.is_authenticated else None)
        return Response(PrayerListSerializer(prayer).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def pray_for(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        prayer = self.get_object()
        resp, created = PrayerResponse.objects.get_or_create(prayer=prayer, user=request.user)
        if created:
            prayer.prayer_count += 1
            prayer.save()
            return Response({'success': True, 'message': 'Prayer added'})
        return Response({'success': False, 'message': 'You already prayed for this'})

    @action(detail=True, methods=['get'])
    def check_prayed(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response(False)
        exists = PrayerResponse.objects.filter(prayer_id=pk, user=request.user).exists()
        return Response(exists)

    @action(detail=True, methods=['post'])
    def mark_answered(self, request, pk=None):
        prayer = self.get_object()
        prayer.status = 'answered'
        prayer.answered_at = timezone.now()
        prayer.save()
        return Response({'status': 'answered'})

    @action(detail=False, methods=['get'])
    def answered(self, request):
        qs = Prayer.objects.filter(status='answered').order_by('-answered_at')
        serializer = PrayerListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        active = Prayer.objects.filter(status='active').count()
        answered = Prayer.objects.filter(status='answered').count()
        total = Prayer.objects.count()
        return Response({'active': active, 'answered': answered, 'total': total})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_queryset(self):
        target_type = self.request.query_params.get('target_type')
        target_id = self.request.query_params.get('target_id')
        qs = Comment.objects.all()
        if target_type:
            qs = qs.filter(target_type=target_type)
        if target_id:
            qs = qs.filter(target_id=target_id)
        return qs.order_by('-created_at')

    def create(self, request):
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(user=request.user if request.user.is_authenticated else None)
        if comment.target_type == 'testimony':
            try:
                from .models import Testimony
                testimony = Testimony.objects.get(id=comment.target_id)
                testimony.prayer_count = Comment.objects.filter(target_type='testimony', target_id=comment.target_id).count()
                testimony.save()
            except Exception:
                pass
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class PrayerCircleViewSet(viewsets.ModelViewSet):
    queryset = PrayerCircle.objects.all()
    serializer_class = PrayerCircleSerializer

    def get_queryset(self):
        if self.action == 'list':
            return PrayerCircle.objects.filter(is_public=True).order_by('-member_count')
        return PrayerCircle.objects.all()

    def create(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        serializer = PrayerCircleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        circle = serializer.save(created_by=request.user)
        CircleMember.objects.create(circle=circle, user=request.user, role='moderator')
        return Response(PrayerCircleSerializer(circle).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        circle = self.get_object()
        member, created = CircleMember.objects.get_or_create(circle=circle, user=request.user)
        if created:
            circle.member_count += 1
            circle.save()
            return Response({'success': True})
        return Response({'success': False, 'message': 'Already a member'})

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        circle = self.get_object()
        CircleMember.objects.filter(circle=circle, user=request.user).delete()
        if circle.member_count > 1:
            circle.member_count -= 1
            circle.save()
        return Response({'success': True})

    @action(detail=True, methods=['get'])
    def check_membership(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'is_member': False, 'role': None})
        try:
            membership = CircleMember.objects.get(circle_id=pk, user=request.user)
            return Response({'is_member': True, 'role': membership.role})
        except CircleMember.DoesNotExist:
            return Response({'is_member': False, 'role': None})

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        circle = self.get_object()
        membership = None
        if request.user.is_authenticated:
            membership = CircleMember.objects.filter(circle=circle, user=request.user).first()
        is_member = membership is not None

        if request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({'detail': 'Authentication required'}, status=401)
            if not is_member:
                return Response({'detail': 'You must be a member of this circle to post messages'}, status=403)
            
            content = request.data.get('content', '').strip()
            image_url = None

            # Handle image upload (moderators only)
            uploaded_file = request.FILES.get('image')
            if uploaded_file:
                if membership.role != 'moderator':
                    return Response({'detail': 'Only moderators can post images'}, status=403)
                ext = os.path.splitext(uploaded_file.name)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                    return Response({'detail': 'Unsupported image type. Only JPG, PNG, GIF, WEBP are allowed.'}, status=400)
                if uploaded_file.size > 5 * 1024 * 1024:  # 5MB limit
                    return Response({'detail': 'Image must be under 5MB'}, status=400)
                
                # Hardened Image Validation via PIL
                from PIL import Image
                try:
                    img = Image.open(uploaded_file)
                    img.verify()
                    uploaded_file.seek(0)
                except Exception:
                    return Response({'detail': 'Invalid image file. The uploaded file is corrupted or not a valid image.'}, status=400)
                
                filename = f"{uuid.uuid4()}{ext}"
                path = default_storage.save(os.path.join('circle_images', filename), ContentFile(uploaded_file.read()))
                image_url = request.build_absolute_uri(settings.MEDIA_URL + path)

            if not content and not image_url:
                return Response({'detail': 'Message must have text or an image'}, status=400)
            
            from .models import CircleMessage
            from .serializers import CircleMessageSerializer
            msg = CircleMessage.objects.create(circle=circle, user=request.user, content=content, image=image_url)
            return Response(CircleMessageSerializer(msg, context={'request': request}).data, status=status.HTTP_201_CREATED)
            
        else:
            if not circle.is_public and not is_member:
                return Response({'detail': 'You do not have permission to view messages in this private circle'}, status=403)
                
            from .models import CircleMessage
            from .serializers import CircleMessageSerializer
            messages = CircleMessage.objects.filter(circle=circle).order_by('created_at')
            serializer = CircleMessageSerializer(messages[:100], many=True, context={'request': request})
            return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='messages/(?P<message_id>[0-9]+)/react')
    def react(self, request, pk=None, message_id=None):
        circle = self.get_object()
        is_member = request.user.is_authenticated and CircleMember.objects.filter(circle=circle, user=request.user).exists()

        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        if not is_member:
            return Response({'detail': 'You must be a member to react'}, status=403)

        reaction_type = request.data.get('reaction_type', '').strip()
        valid_types = ['amen', 'love', 'fire', 'strength', 'peace']
        if reaction_type not in valid_types:
            return Response({'detail': f'Invalid reaction. Must be one of: {valid_types}'}, status=400)

        from .models import CircleMessage, CircleMessageReaction
        try:
            message = CircleMessage.objects.get(id=message_id, circle=circle)
        except CircleMessage.DoesNotExist:
            return Response({'detail': 'Message not found'}, status=404)

        # Enforce single reaction per user per message
        existing = CircleMessageReaction.objects.filter(message=message, user=request.user).first()
        if existing:
            if existing.reaction_type == reaction_type:
                # Clicked same reaction -> toggle off / remove
                existing.delete()
                action_type = 'removed'
            else:
                # Clicked different reaction -> switch reaction
                existing.reaction_type = reaction_type
                existing.save()
                action_type = 'switched'
        else:
            # First reaction on this message
            CircleMessageReaction.objects.create(message=message, user=request.user, reaction_type=reaction_type)
            action_type = 'added'

        # Return updated reaction counts and user reactions
        from django.db.models import Count
        counts = CircleMessageReaction.objects.filter(message=message).values('reaction_type').annotate(count=Count('id'))
        reactions = {item['reaction_type']: item['count'] for item in counts}
        user_reactions = list(CircleMessageReaction.objects.filter(message=message, user=request.user).values_list('reaction_type', flat=True))

        return Response({'action': action_type, 'reactions': reactions, 'user_reactions': user_reactions})

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        circle = self.get_object()
        if not circle.is_public:
            is_member = request.user.is_authenticated and CircleMember.objects.filter(circle=circle, user=request.user).exists()
            if not is_member:
                return Response({'detail': 'You do not have permission to view members in this private circle'}, status=403)
                
        members = CircleMember.objects.filter(circle=circle).order_by('-role', 'joined_at')
        from .serializers import CircleMemberSerializer
        serializer = CircleMemberSerializer(members, many=True)
        return Response(serializer.data)


class ScheduledPrayerViewSet(viewsets.ModelViewSet):
    queryset = ScheduledPrayer.objects.all()
    serializer_class = ScheduledPrayerSerializer

    def perform_create(self, serializer):
        is_live = self.request.data.get('is_live', False)
        if is_live and self.request.user.subscription_plan != 'premium' and self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only Premium Watchers can go live.")
        serializer.save(host=self.request.user)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        two_hours_ago = timezone.now() - timezone.timedelta(hours=2)
        qs = ScheduledPrayer.objects.filter(scheduled_at__gte=two_hours_ago).order_by('scheduled_at')
        serializer = ScheduledPrayerSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def live(self, request):
        session = ScheduledPrayer.objects.filter(is_live=True).first()
        if session:
            return Response(ScheduledPrayerSerializer(session).data)
        return Response(None)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        session = self.get_object()
        from .models import LiveRoomParticipant
        participant, created = LiveRoomParticipant.objects.get_or_create(session=session, user=request.user)
        session.participant_count = LiveRoomParticipant.objects.filter(session=session).count()
        session.save()
        return Response({'status': 'joined', 'is_co_moderator': participant.is_co_moderator})

    @action(detail=True, methods=['post'])
    def heartbeat(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        session = self.get_object()
        from .models import LiveRoomParticipant
        from django.utils import timezone
        
        LiveRoomParticipant.objects.filter(session=session, user=request.user).update(last_seen=timezone.now())
        
        threshold = timezone.now() - timezone.timedelta(seconds=10)
        inactive = LiveRoomParticipant.objects.filter(session=session, last_seen__lt=threshold)
        if inactive.exists():
            inactive.delete()
            
        session.participant_count = LiveRoomParticipant.objects.filter(session=session).count()
        session.save()
        return Response({'status': 'active', 'participant_count': session.participant_count})

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        session = self.get_object()
        from .models import LiveRoomParticipant
        LiveRoomParticipant.objects.filter(session=session, user=request.user).delete()
        session.participant_count = LiveRoomParticipant.objects.filter(session=session).count()
        session.save()
        return Response({'status': 'left'})

    @action(detail=True, methods=['get'])
    def sync(self, request, pk=None):
        session = self.get_object()
        from .models import LiveRoomMessage, LiveRoomParticipant, LiveRoomReaction
        from .serializers import LiveRoomMessageSerializer, LiveRoomParticipantSerializer
        from django.utils import timezone
        
        last_msg_id = request.query_params.get('last_message_id')
        last_react_id = request.query_params.get('last_reaction_id')
        
        participants = LiveRoomParticipant.objects.filter(session=session).order_by('joined_at')
        participants_data = LiveRoomParticipantSerializer(participants, many=True).data
        
        messages_qs = LiveRoomMessage.objects.filter(session=session)
        if last_msg_id and last_msg_id.isdigit():
            messages_qs = messages_qs.filter(id__gt=int(last_msg_id))
        messages_data = LiveRoomMessageSerializer(messages_qs[:100], many=True).data
        
        recent_time = timezone.now() - timezone.timedelta(seconds=15)
        reactions_qs = LiveRoomReaction.objects.filter(session=session, created_at__gte=recent_time)
        if last_react_id and last_react_id.isdigit():
            reactions_qs = reactions_qs.filter(id__gt=int(last_react_id))
        
        reactions_data = []
        for r in reactions_qs[:50]:
            reactions_data.append({
                'id': r.id,
                'emoji': r.emoji,
                'label': r.label,
                'user_id': r.user_id,
                'x': hash(str(r.id)) % 70 + 15
            })
            
        old_reactions = LiveRoomReaction.objects.filter(session=session, created_at__lt=timezone.now() - timezone.timedelta(minutes=1))
        old_reactions.delete()
        
        return Response({
            'participants': participants_data,
            'messages': messages_data,
            'reactions': reactions_data
        })

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        session = self.get_object()
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'detail': 'Message text is required'}, status=400)
            
        from .models import LiveRoomMessage
        from .serializers import LiveRoomMessageSerializer
        msg = LiveRoomMessage.objects.create(session=session, user=request.user, text=text)
        return Response(LiveRoomMessageSerializer(msg).data, status=201)

    @action(detail=True, methods=['post'])
    def send_reaction(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        session = self.get_object()
        emoji = request.data.get('emoji', '').strip()
        label = request.data.get('label', '').strip()
        if not emoji or not label:
            return Response({'detail': 'Emoji and label are required'}, status=400)
            
        from .models import LiveRoomReaction
        reaction = LiveRoomReaction.objects.create(session=session, user=request.user, emoji=emoji, label=label)
        return Response({'status': 'reaction_sent', 'id': reaction.id})

    @action(detail=True, methods=['post'])
    def toggle_co_moderator(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        session = self.get_object()
        if request.user != session.host and request.user.role != 'admin':
            return Response({'detail': 'Only the moderator can assign co-moderators'}, status=403)
            
        target_user_id = request.data.get('user_id')
        if not target_user_id:
            return Response({'detail': 'user_id is required'}, status=400)
            
        from .models import LiveRoomParticipant
        participant = LiveRoomParticipant.objects.filter(session=session, user_id=target_user_id).first()
        if not participant:
            return Response({'detail': 'Participant not found in the room'}, status=404)
            
        participant.is_co_moderator = not participant.is_co_moderator
        participant.save()
        return Response({'status': 'co_moderator_toggled', 'is_co_moderator': participant.is_co_moderator})


class ForumTopicViewSet(viewsets.ModelViewSet):
    queryset = ForumTopic.objects.all()
    serializer_class = ForumTopicSerializer

    def get_queryset(self):
        qs = ForumTopic.objects.all()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs

    def create(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        serializer = ForumTopicSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        topic = serializer.save(user=request.user)
        return Response(ForumTopicSerializer(topic).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        topic = self.get_object()
        topic.view_count += 1
        topic.save()
        replies = ForumReply.objects.filter(topic=topic).order_by('created_at')
        return Response(ForumReplySerializer(replies, many=True).data)

    @action(detail=True, methods=['post'])
    def add_reply(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        topic = self.get_object()
        content = request.data.get('content', '')
        if not content:
            return Response({'detail': 'Content required'}, status=400)
        reply = ForumReply.objects.create(topic=topic, user=request.user, content=content)
        topic.reply_count += 1
        topic.save()
        return Response(ForumReplySerializer(reply).data, status=201)


class ForumReplyViewSet(viewsets.ModelViewSet):
    queryset = ForumReply.objects.all()
    serializer_class = ForumReplySerializer


def rate_limit_login(request, username):
    ip = request.META.get('REMOTE_ADDR', '')
    cache_key_ip = f"login_fails_ip_{ip}"
    cache_key_user = f"login_fails_user_{username}"
    
    fails_ip = cache.get(cache_key_ip, 0)
    fails_user = cache.get(cache_key_user, 0)
    
    if fails_ip >= 5 or fails_user >= 5:
        return False
    return True

def record_login_failure(request, username):
    ip = request.META.get('REMOTE_ADDR', '')
    cache_key_ip = f"login_fails_ip_{ip}"
    cache_key_user = f"login_fails_user_{username}"
    
    fails_ip = cache.get(cache_key_ip, 0) + 1
    fails_user = cache.get(cache_key_user, 0) + 1
    
    cache.set(cache_key_ip, fails_ip, 300)  # 5 min block
    cache.set(cache_key_user, fails_user, 300)

def clear_login_failures(request, username):
    ip = request.META.get('REMOTE_ADDR', '')
    cache_key_ip = f"login_fails_ip_{ip}"
    cache_key_user = f"login_fails_user_{username}"
    cache.delete(cache_key_ip)
    cache.delete(cache_key_user)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_csrf_token(request):
    return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'detail': 'Username and password are required'}, status=400)
        
    if not rate_limit_login(request, username):
        return Response({'detail': 'Too many failed login attempts. Please try again in 5 minutes.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
    user = authenticate(request, username=username, password=password)
    if user:
        django_login(request, user)
        clear_login_failures(request, username)
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'detail': 'Logged in',
            'token': token.key,
            'user': UserSerializer(user).data
        })
        
    record_login_failure(request, username)
    return Response({'detail': 'Invalid credentials'}, status=400)


@api_view(['POST'])
def api_logout(request):
    django_logout(request)
    return Response({'detail': 'Logged out'})


@api_view(['POST'])
@permission_classes([AllowAny])
def api_google_auth(request):
    token = request.data.get('credential')
    if not token:
        return Response({'detail': 'Google ID token (credential) is required'}, status=400)

    # Call Google's tokeninfo API to verify the token securely
    import requests
    verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"

    try:
        res = requests.get(verify_url, timeout=10)
        if not res.ok:
            return Response({'detail': 'Invalid Google token'}, status=400)
        
        token_info = res.json()
        
        # Verify email is verified
        if token_info.get('email_verified') != 'true' and token_info.get('email_verified') != True:
            return Response({'detail': 'Google email is not verified'}, status=400)
        
        email = token_info.get('email')
        first_name = token_info.get('given_name', '')
        last_name = token_info.get('family_name', '')
        picture = token_info.get('picture', '')

        if not email:
            return Response({'detail': 'Email not found in Google account info'}, status=400)

        # Get or create User
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(email=email).first()

        if not user:
            # Create a new user
            username = email.split('@')[0]
            # Ensure username uniqueness
            original_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1

            # Generate random password
            import secrets
            random_password = secrets.token_hex(16)
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=random_password,
                first_name=first_name,
                last_name=last_name,
                avatar=picture
            )

        # Log user in
        django_login(request, user)
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'detail': 'Logged in successfully',
            'token': token.key,
            'user': UserSerializer(user).data
        })

    except requests.exceptions.RequestException as e:
        return Response({'detail': f'Network error verifying token: {str(e)}'}, status=502)
    except Exception as e:
        return Response({'detail': f'Authentication error: {str(e)}'}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if not username or not email or not password:
        return Response({'detail': 'Username, email, and password are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'detail': 'Username is already taken'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'detail': 'Email is already registered'}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        # Log user in immediately upon registration
        django_login(request, user)
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'detail': str(e)}, status=400)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Not authenticated'}, status=401)
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=['patch', 'put'], url_path='update')
    def update_profile(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Not authenticated'}, status=401)
        user = request.user
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        bio = request.data.get('bio')
        avatar = request.data.get('avatar')

        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if bio is not None:
            user.bio = bio
        if avatar is not None:
            user.avatar = avatar

        user.save()
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['post'], url_path='upgrade')
    def upgrade_subscription(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        plan = request.data.get('plan')
        if plan not in ['free', 'regular', 'premium']:
            return Response({'detail': 'Invalid plan choice'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.subscription_plan = plan
        user.save()
        return Response({
            'success': True,
            'subscription_plan': user.subscription_plan,
            'message': f'Subscription upgraded to {plan.capitalize()} successfully!'
        })

    @action(detail=False, methods=['post'], url_path='verify-payment')
    def verify_payment(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)

        transaction_id = request.data.get('transaction_id')
        plan = request.data.get('plan')

        if not transaction_id or not plan:
            return Response({'detail': 'transaction_id and plan are required'}, status=400)

        if plan not in ['regular', 'premium']:
            return Response({'detail': 'Invalid subscription plan'}, status=400)

        # Expected values (regular: NGN 5,000, premium: NGN 15,000)
        expected_amount = 5000.0 if plan == 'regular' else 15000.0
        expected_currency = 'NGN'

        # Call Flutterwave verification API
        secret_key = os.getenv('FLUTTERWAVE_SECRET_KEY')
        base_url = os.getenv('FLUTTERWAVE_BASE_URL', 'https://api.flutterwave.com/v3')
        
        if not secret_key:
            return Response({'detail': 'Flutterwave integration is misconfigured on server'}, status=500)

        import requests
        headers = {
            'Authorization': f'Bearer {secret_key}',
            'Content-Type': 'application/json',
        }
        url = f"{base_url}/transactions/{transaction_id}/verify"

        try:
            res = requests.get(url, headers=headers, timeout=10)
            if not res.ok:
                return Response({'detail': f'Flutterwave verification failed: HTTP {res.status_code}'}, status=400)
            
            res_data = res.json()
            if res_data.get('status') != 'success':
                return Response({'detail': f"Flutterwave returned error: {res_data.get('message', 'Unknown')}"}, status=400)
            
            tx_data = res_data.get('data', {})
            
            # Match fields securely
            flw_status = tx_data.get('status')
            flw_amount = float(tx_data.get('amount', 0))
            flw_currency = tx_data.get('currency')

            if flw_status != 'successful':
                return Response({'detail': f'Transaction status is: {flw_status}'}, status=400)
            
            if flw_currency != expected_currency:
                return Response({'detail': f'Currency mismatch: expected {expected_currency}, got {flw_currency}'}, status=400)
            
            if flw_amount < expected_amount:
                return Response({'detail': f'Amount mismatch: expected {expected_amount}, got {flw_amount}'}, status=400)

            # Fetch active subscription from Flutterwave to store ID
            sub_id = None
            try:
                sub_url = f"{base_url}/subscriptions?email={user.email}"
                sub_res = requests.get(sub_url, headers=headers, timeout=10)
                if sub_res.ok:
                    sub_data = sub_res.json()
                    if sub_data.get('status') == 'success':
                        subs = sub_data.get('data', [])
                        # Find the active subscription matching this user
                        for s in subs:
                            if s.get('status') == 'active':
                                sub_id = str(s.get('id'))
                                break
            except Exception as e:
                print(f"Error fetching subscription details: {str(e)}")

            # Verification successful! Upgrade user plan
            user = request.user
            user.subscription_plan = plan
            if sub_id:
                user.flutterwave_subscription_id = sub_id
            user.save()

            return Response({
                'success': True,
                'subscription_plan': user.subscription_plan,
                'flutterwave_subscription_id': user.flutterwave_subscription_id,
                'message': f'Subscription upgraded to {plan.capitalize()} successfully!'
            })

        except requests.exceptions.RequestException as e:
            return Response({'detail': f'Network error contacting Flutterwave: {str(e)}'}, status=502)
        except Exception as e:
            return Response({'detail': f'Verification error: {str(e)}'}, status=500)

    @action(detail=False, methods=['post'], url_path='cancel-subscription')
    def cancel_subscription(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=401)
        
        user = request.user
        sub_id = user.flutterwave_subscription_id

        # If there's an active Flutterwave subscription ID, cancel it with Flutterwave API
        if sub_id:
            secret_key = os.getenv('FLUTTERWAVE_SECRET_KEY')
            base_url = os.getenv('FLUTTERWAVE_BASE_URL', 'https://api.flutterwave.com/v3')
            
            if not secret_key:
                return Response({'detail': 'Flutterwave integration is misconfigured on server'}, status=500)

            import requests
            headers = {
                'Authorization': f'Bearer {secret_key}',
                'Content-Type': 'application/json',
            }
            # Flutterwave endpoint to cancel subscription: PUT /subscriptions/{id}/cancel
            url = f"{base_url}/subscriptions/{sub_id}/cancel"
            
            try:
                res = requests.put(url, headers=headers, timeout=10)
                print(f"Flutterwave cancel response: {res.status_code} - {res.text}")
            except Exception as e:
                print(f"Error calling Flutterwave cancel: {str(e)}")

        # Revert user to free plan
        user.subscription_plan = 'free'
        user.flutterwave_subscription_id = None
        user.save()

        return Response({
            'success': True,
            'subscription_plan': user.subscription_plan,
            'message': 'Subscription cancelled successfully. You are now on the Free plan.'
        })


class AdminViewSet(viewsets.ViewSet):
    def list_stats(self, request):
        if not (request.user.is_authenticated and request.user.role == 'admin'):
            return Response({'detail': 'Forbidden'}, status=403)
        pending_testimonies = Testimony.objects.filter(status='pending').count()
        total_users = User.objects.count()
        active_prayers = Prayer.objects.filter(status='active').count()
        approved_testimonies = Testimony.objects.filter(status='approved').count()
        return Response({
            'pendingTestimonies': pending_testimonies,
            'totalUsers': total_users,
            'activePrayers': active_prayers,
            'approvedTestimonies': approved_testimonies,
        })

    def list_users(self, request):
        if not (request.user.is_authenticated and request.user.role == 'admin'):
            return Response({'detail': 'Forbidden'}, status=403)
        users = User.objects.all().order_by('-created_at')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


from rest_framework.permissions import BasePermission

class IsAppAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class SlideViewSet(viewsets.ModelViewSet):
    queryset = Slide.objects.all()
    serializer_class = SlideSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAppAdmin()]


from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid

@api_view(['POST'])
def api_upload(request):
    if not (request.user.is_authenticated and request.user.role == 'admin'):
        return Response({'detail': 'Forbidden'}, status=403)

    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        return Response({'detail': 'No file uploaded'}, status=400)

    # Validate file size
    if uploaded_file.size > 20 * 1024 * 1024:  # 20MB limit
        return Response({'detail': 'File size exceeds the 20MB limit.'}, status=400)

    # Check extension
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi', '.webm']:
        return Response({'detail': 'Unsupported file type'}, status=400)

    # If image, verify via PIL
    if ext in ['.jpg', '.jpeg', '.png', '.gif']:
        from PIL import Image
        try:
            img = Image.open(uploaded_file)
            img.verify()
            uploaded_file.seek(0)
        except Exception:
            return Response({'detail': 'Invalid image file. The uploaded file is corrupted or not a valid image.'}, status=400)

    # Generate unique filename to avoid conflict
    filename = f"{uuid.uuid4()}{ext}"
    path = default_storage.save(os.path.join('slides', filename), ContentFile(uploaded_file.read()))

    # Generate full URL
    url = request.build_absolute_uri(settings.MEDIA_URL + path)
    return Response({'url': url})


@api_view(['POST'])
def api_user_upload(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'Not authenticated'}, status=401)

    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        return Response({'detail': 'No file uploaded'}, status=400)

    # Validate file size
    if uploaded_file.size > 5 * 1024 * 1024:  # 5MB limit
        return Response({'detail': 'File size exceeds the 5MB limit.'}, status=400)

    # Check extension
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.gif']:
        return Response({'detail': 'Unsupported image type. Only JPG, PNG, GIF are allowed.'}, status=400)

    # Verify via PIL
    from PIL import Image
    try:
        img = Image.open(uploaded_file)
        img.verify()
        uploaded_file.seek(0)
    except Exception:
        return Response({'detail': 'Invalid image file. The uploaded file is corrupted or not a valid image.'}, status=400)

    # Generate unique filename to avoid conflict
    filename = f"{uuid.uuid4()}{ext}"
    path = default_storage.save(os.path.join('avatars', filename), ContentFile(uploaded_file.read()))

    # Generate full URL
    url = request.build_absolute_uri(settings.MEDIA_URL + path)
    return Response({'url': url})
