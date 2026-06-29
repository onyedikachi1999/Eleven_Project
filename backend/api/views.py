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
            return Response(False)
        exists = CircleMember.objects.filter(circle_id=pk, user=request.user).exists()
        return Response(exists)

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        circle = self.get_object()
        is_member = request.user.is_authenticated and CircleMember.objects.filter(circle=circle, user=request.user).exists()

        if request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({'detail': 'Authentication required'}, status=401)
            if not is_member:
                return Response({'detail': 'You must be a member of this circle to post messages'}, status=403)
            
            content = request.data.get('content', '').strip()
            if not content:
                return Response({'detail': 'Message content cannot be empty'}, status=400)
            
            from .models import CircleMessage
            from .serializers import CircleMessageSerializer
            msg = CircleMessage.objects.create(circle=circle, user=request.user, content=content)
            return Response(CircleMessageSerializer(msg).data, status=status.HTTP_201_CREATED)
            
        else:
            if not circle.is_public and not is_member:
                return Response({'detail': 'You do not have permission to view messages in this private circle'}, status=403)
                
            from .models import CircleMessage
            from .serializers import CircleMessageSerializer
            messages = CircleMessage.objects.filter(circle=circle).order_by('created_at')
            serializer = CircleMessageSerializer(messages[:100], many=True)
            return Response(serializer.data)

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


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user:
        django_login(request, user)
        return Response({'detail': 'Logged in'})
    return Response({'detail': 'Invalid credentials'}, status=400)


@api_view(['POST'])
def api_logout(request):
    django_logout(request)
    return Response({'detail': 'Logged out'})


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
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
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
