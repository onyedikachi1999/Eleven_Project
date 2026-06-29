from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import (
    User, Testimony, Prayer, PrayerCircle, ScheduledPrayer, ForumTopic, ForumReply
)


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # Create a default user first for FK references
        user, _ = User.objects.get_or_create(
            username='eleven_user',
            defaults={
                'email': 'user@eleven.app',
                'first_name': 'ELEVEN',
                'last_name': 'User',
                'role': 'user',
            }
        )
        user.set_password('eleven2025')
        user.save()

        # Create admin user
        admin, _ = User.objects.get_or_create(
            username='eleven_admin',
            defaults={
                'email': 'admin@eleven.app',
                'first_name': 'ELEVEN',
                'last_name': 'Admin',
                'role': 'admin',
            }
        )
        admin.set_password('eleven2025')
        admin.save()

        # Seed Testimonies
        testimonies_data = [
            {
                'title': 'Healed from Chronic Back Pain After 5 Years',
                'content': 'For five years I suffered from debilitating back pain that doctors could not diagnose. I tried everything physical therapy, acupuncture, medication. Nothing worked. Then one evening at a prayer gathering, the pastor called out chronic pain and asked anyone suffering to stand. I stood, trembling. As the community laid hands and prayed, I felt a warmth spread through my spine. The next morning, I woke up pain-free for the first time in years. That was eight months ago, and the pain has never returned.',
                'category': 'healing', 'type': 'text', 'is_anonymous': True,
                'status': 'approved', 'prayer_count': 47, 'amen_count': 89, 'view_count': 342,
                'thumbnail_url': '/images/thumb-healing.jpg',
            },
            {
                'title': 'My Family Was Restored After Divorce Papers Were Filed',
                'content': 'Our marriage was at the breaking point. The divorce papers were signed and ready to be filed. We had not spoken a meaningful word to each other in months. A friend invited me to a couples prayer retreat as a last resort. During the prayer time, something broke open in both of our hearts. We wept together for the first time in years. We tore up the divorce papers that weekend. Today, we are celebrating our 20th anniversary.',
                'category': 'family', 'type': 'text', 'is_anonymous': True,
                'status': 'approved', 'prayer_count': 62, 'amen_count': 134, 'view_count': 521,
                'thumbnail_url': '/images/thumb-family.jpg',
            },
            {
                'title': 'From Job Loss to Dream Career in 90 Days',
                'content': 'I was laid off unexpectedly during company downsizing. With three children and a mortgage, panic set in immediately. I spent the first week in prayer and fasting instead of job searching. During that time, I felt led to pivot from finance into tech. I enrolled in a coding bootcamp, and within 90 days, I landed a role at a company whose mission aligns with my values. The salary is 40% higher than my previous job.',
                'category': 'career', 'type': 'text', 'is_anonymous': False,
                'status': 'approved', 'prayer_count': 38, 'amen_count': 72, 'view_count': 289,
                'thumbnail_url': '/images/thumb-career.jpg',
            },
            {
                'title': 'Financial Breakthrough: Debt Free After $80,000',
                'content': 'We were drowning in $80,000 of debt from medical bills and student loans. The stress was destroying my marriage and my health. I started tithing faithfully even when it made no mathematical sense. Within 18 months, through a series of what I can only call miracles an unexpected inheritance, a debt forgiveness program, and a promotion every single dollar was paid off. We are now debt-free.',
                'category': 'finance', 'type': 'text', 'is_anonymous': True,
                'status': 'approved', 'prayer_count': 55, 'amen_count': 98, 'view_count': 410,
                'thumbnail_url': '/images/thumb-prayer.jpg',
            },
            {
                'title': 'Delivered from Addiction That Controlled 15 Years of My Life',
                'content': 'I battled addiction for 15 years. I tried rehab four times, therapy, medication nothing stuck. I was convinced I would die an addict. Then one desperate night, I called a prayer line and a stranger prayed with me for three hours. They did not judge, did not offer advice just prayed. Something shifted that night. I have not touched substances in three years.',
                'category': 'deliverance', 'type': 'text', 'is_anonymous': True,
                'status': 'approved', 'prayer_count': 91, 'amen_count': 156, 'view_count': 678,
                'thumbnail_url': '/images/thumb-prayer.jpg',
            },
            {
                'title': 'God Provided a Home When We Were Homeless',
                'content': 'After fleeing an abusive situation with my two children, we ended up in a shelter with nowhere to go. Every night I prayed over my sleeping children that God would provide. Within two weeks, a woman from a local church offered us her basement apartment rent-free for six months while I got back on my feet. She became family. Today I have my own apartment, a steady job, and my children are thriving.',
                'category': 'family', 'type': 'text', 'is_anonymous': True,
                'status': 'approved', 'prayer_count': 73, 'amen_count': 112, 'view_count': 445,
                'thumbnail_url': '/images/thumb-family.jpg',
            },
            {
                'title': 'Miraculous Healing of My Daughter Rare Condition',
                'content': 'My 7-year-old daughter was diagnosed with a rare autoimmune condition that doctors said had no cure. She was in constant pain and losing weight rapidly. Our entire church fasted and prayed for 21 days. We took her for a follow-up scan and the doctors were stunned the inflammation was completely gone. That was two years ago, and she has been perfectly healthy ever since.',
                'category': 'healing', 'type': 'video', 'is_anonymous': False,
                'status': 'approved', 'prayer_count': 128, 'amen_count': 234, 'view_count': 892,
                'media_url': '/images/thumb-healing.jpg', 'thumbnail_url': '/images/thumb-healing.jpg',
            },
            {
                'title': 'From Skeptic to Believer: A Scientist Journey to Faith',
                'content': 'I was a hardened skeptic and research scientist who dismissed faith as superstition. Then I had a personal experience during a meditation retreat that I could not explain through science. I started reading the Bible with a critical eye, expecting to debunk it. Instead, I found profound wisdom that answered questions my scientific training never could. Today I lead a group for professionals wrestling with faith questions.',
                'category': 'general', 'type': 'text', 'is_anonymous': False,
                'status': 'approved', 'prayer_count': 44, 'amen_count': 87, 'view_count': 367,
                'thumbnail_url': '/images/thumb-career.jpg',
            },
        ]

        for data in testimonies_data:
            Testimony.objects.create(user=user, **data)

        prayers_data = [
            {'content': 'Please pray for my mother who was just diagnosed with stage 2 breast cancer. We are believing for complete healing. She starts treatment next week.', 'category': 'healing', 'urgency': 'high', 'is_anonymous': False, 'status': 'active', 'prayer_count': 34},
            {'content': 'I have been unemployed for 8 months and my savings are running out. I have two interviews this week. Please pray for favor.', 'category': 'career', 'urgency': 'high', 'is_anonymous': True, 'status': 'active', 'prayer_count': 56},
            {'content': 'My teenage son has been struggling with depression and anxiety. He is seeing a therapist but I can see he is still hurting. Please pray for his healing.', 'category': 'family', 'urgency': 'medium', 'is_anonymous': False, 'status': 'active', 'prayer_count': 42},
            {'content': 'I am drowning in debt from medical bills after my surgery. We need a financial miracle or wisdom to navigate this.', 'category': 'finance', 'urgency': 'medium', 'is_anonymous': True, 'status': 'active', 'prayer_count': 28},
            {'content': 'After years of struggling with pornography addiction, I am finally ready to be free. I need prayer for strength and complete deliverance.', 'category': 'deliverance', 'urgency': 'medium', 'is_anonymous': True, 'status': 'active', 'prayer_count': 67},
            {'content': 'Praise report! We were trying to conceive for 4 years with two failed IVF cycles. Last month we found out we are pregnant naturally! Thank you to everyone who prayed with us!', 'category': 'family', 'urgency': 'low', 'is_anonymous': False, 'status': 'answered', 'prayer_count': 156, 'answered_at': timezone.now()},
            {'content': 'I am preparing for my bar exam in two weeks. I failed once before. Please pray for peace, clarity of mind, and that I pass this time.', 'category': 'career', 'urgency': 'medium', 'is_anonymous': False, 'status': 'active', 'prayer_count': 19},
            {'content': 'My elderly father is having hip replacement surgery tomorrow. He is 78 and we are nervous. Please pray for successful surgery and quick healing.', 'category': 'healing', 'urgency': 'high', 'is_anonymous': False, 'status': 'active', 'prayer_count': 45},
        ]

        for data in prayers_data:
            Prayer.objects.create(user=user, **data)

        circles_data = [
            {'name': 'Healing & Restoration Circle', 'description': 'A safe space for those seeking physical, emotional, and spiritual healing. We pray together every Tuesday and Thursday evening.', 'category': 'healing', 'is_public': True, 'member_count': 127},
            {'name': 'Financial Breakthrough Group', 'description': 'Join us as we pray for financial wisdom, debt freedom, and prosperity. We share testimonies of God provision.', 'category': 'finance', 'is_public': True, 'member_count': 89},
            {'name': 'Family Restoration Prayer', 'description': 'For marriages, parent-child relationships, and family unity. We believe no family is beyond God ability to restore.', 'category': 'family', 'is_public': True, 'member_count': 156},
            {'name': 'Purpose & Career Clarity', 'description': 'Seeking direction in your career or calling? This circle prays for open doors, divine connections, and clarity.', 'category': 'career', 'is_public': True, 'member_count': 74},
        ]

        for data in circles_data:
            PrayerCircle.objects.create(created_by=user, **data)

        now = timezone.now()
        schedules_data = [
            {'title': 'Evening Devotional Prayer', 'description': 'Join us for a 30-minute guided prayer session focused on gratitude and reflection.', 'scheduled_at': now + timezone.timedelta(hours=2), 'duration': 30, 'is_live': True, 'participant_count': 23},
            {'title': 'Midnight Prayer Watch', 'description': 'A powerful hour of intercession. We pray for healing, deliverance, and breakthrough.', 'scheduled_at': now + timezone.timedelta(hours=8), 'duration': 60, 'is_live': False, 'participant_count': 45},
            {'title': 'Youth Prayer Gathering', 'description': 'Young people coming together to pray for their generation.', 'scheduled_at': now + timezone.timedelta(days=1), 'duration': 45, 'is_live': False, 'participant_count': 67},
        ]

        for data in schedules_data:
            ScheduledPrayer.objects.create(host=user, **data)

        topics_data = [
            {'title': 'How do you maintain faith during long seasons of waiting?', 'content': 'I have been praying for a breakthrough in my career for over two years now. Some days my faith is strong, other days I feel like giving up. How do you all stay encouraged?', 'category': 'faith', 'user': user, 'reply_count': 12, 'view_count': 156},
            {'title': 'Navigating faith and mental health struggles', 'content': 'As someone who deals with anxiety and depression, I sometimes hear people say just pray more. How do you balance spiritual warfare with practical mental health care?', 'category': 'life', 'user': user, 'reply_count': 18, 'view_count': 234},
            {'title': 'Dating with purpose: Red flags and green flags', 'content': 'For those who are married or in healthy relationships what were the signs that let you know your partner was the one?', 'category': 'relationships', 'user': user, 'reply_count': 24, 'view_count': 312},
            {'title': 'Career transition testimony and advice needed', 'content': 'After 15 years in corporate marketing, I feel called to full-time ministry. Has anyone made a similar transition?', 'category': 'career_forum', 'user': user, 'reply_count': 9, 'view_count': 189},
            {'title': 'Prayer request for our community outreach this weekend', 'content': 'Our church is hosting a community feeding program this Saturday. We are expecting 300+ people. Please pray for enough food and volunteer energy.', 'category': 'prayer', 'user': user, 'reply_count': 6, 'view_count': 98, 'is_pinned': True},
        ]

        topics_created = []
        for data in topics_data:
            topics_created.append(ForumTopic.objects.create(**data))

        replies_data = [
            {'topic': topics_created[0], 'user': user, 'content': 'What helped me during my 3-year wait was keeping a prayer journal. Looking back at answered prayers reminded me that God had been faithful before.'},
            {'topic': topics_created[0], 'user': user, 'content': 'I love the prayer journal idea. I started one too and it has been transformative. Worship music during my commute has become my daily faith anchor.'},
            {'topic': topics_created[1], 'user': user, 'content': 'As a Christian therapist, I appreciate this question. Faith and therapy are not mutually exclusive they are complementary. Taking medication is no different than taking insulin for diabetes.'},
            {'topic': topics_created[2], 'user': user, 'content': 'Green flag: They pray for you without you asking. Red flag: They isolate you from your community. Watch how they treat people who can do nothing for them.'},
            {'topic': topics_created[3], 'user': user, 'content': 'I transitioned from finance to pastoral ministry. Do not quit your day job until you have clarity AND provision. God will open the door when the time is right.'},
        ]

        for data in replies_data:
            ForumReply.objects.create(**data)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded database! Created {User.objects.count()} users, {Testimony.objects.count()} testimonies, {Prayer.objects.count()} prayers, {PrayerCircle.objects.count()} circles, {ForumTopic.objects.count()} topics.'))
