import { getDb } from "../api/queries/connection";
import {
  testimonies,
  prayers,
  prayerCircles,
  scheduledPrayers,
  forumTopics,
  forumReplies,
} from "./schema";

async function seed() {
  const db = getDb();

  // Seed Testimonies
  await db.insert(testimonies).values([
    {
      userId: null,
      title: "Healed from Chronic Back Pain After 5 Years",
      content:
        "For five years I suffered from debilitating back pain that doctors couldn't diagnose. I tried everything — physical therapy, acupuncture, medication. Nothing worked. Then one evening at a prayer gathering, the pastor called out chronic pain and asked anyone suffering to stand. I stood, trembling. As the community laid hands and prayed, I felt a warmth spread through my spine. The next morning, I woke up pain-free for the first time in years. That was eight months ago, and the pain has never returned. I am whole again, and my faith is stronger than ever.",
      category: "healing",
      type: "text",
      thumbnailUrl: "/images/thumb-healing.jpg",
      isAnonymous: true,
      status: "approved",
      prayerCount: 47,
      amenCount: 89,
      viewCount: 342,
    },
    {
      userId: null,
      title: "My Family Was Restored After Divorce Papers Were Filed",
      content:
        "Our marriage was at the breaking point. The divorce papers were signed and ready to be filed. We hadn't spoken a meaningful word to each other in months. A friend invited me to a couples prayer retreat as a last resort. I went alone at first, then my husband agreed to come for just one session. During the prayer time, something broke open in both of our hearts. We wept together for the first time in years. We tore up the divorce papers that weekend. Today, we're celebrating our 20th anniversary and mentoring other couples going through hard times.",
      category: "family",
      type: "text",
      thumbnailUrl: "/images/thumb-family.jpg",
      isAnonymous: true,
      status: "approved",
      prayerCount: 62,
      amenCount: 134,
      viewCount: 521,
    },
    {
      userId: null,
      title: "From Job Loss to Dream Career in 90 Days",
      content:
        "I was laid off unexpectedly during company downsizing. With three children and a mortgage, panic set in immediately. I spent the first week in prayer and fasting instead of job searching — I needed clarity more than anything. During that time, I felt led to pivot from finance into tech, something I'd always been curious about. I enrolled in a coding bootcamp, and within 90 days, I landed a role at a company whose mission aligns with my values. The salary is 40% higher than my previous job. What seemed like a disaster became a door to my true calling.",
      category: "career",
      type: "text",
      thumbnailUrl: "/images/thumb-career.jpg",
      isAnonymous: false,
      status: "approved",
      prayerCount: 38,
      amenCount: 72,
      viewCount: 289,
    },
    {
      userId: null,
      title: "Financial Breakthrough: Debt Free After $80,000",
      content:
        "We were drowning in $80,000 of debt from medical bills and student loans. The stress was destroying my marriage and my health. I started tithing faithfully even when it made no mathematical sense. I also joined a financial prayer group at my church. Within 18 months, through a series of what I can only call miracles — an unexpected inheritance, a debt forgiveness program I didn't know existed, and a promotion — every single dollar was paid off. We are now debt-free and teaching financial stewardship to others.",
      category: "finance",
      type: "text",
      thumbnailUrl: "/images/thumb-prayer.jpg",
      isAnonymous: true,
      status: "approved",
      prayerCount: 55,
      amenCount: 98,
      viewCount: 410,
    },
    {
      userId: null,
      title: "Delivered from Addiction That Controlled 15 Years of My Life",
      content:
        "I battled addiction for 15 years. I tried rehab four times, therapy, medication — nothing stuck. I was convinced I would die an addict. Then one desperate night, I called a prayer line and a stranger prayed with me for three hours. They didn't judge, didn't offer advice — just prayed. Something shifted that night. I haven't touched substances in three years. The cravings simply left. I now run a recovery ministry helping others find the same freedom I found.",
      category: "deliverance",
      type: "text",
      thumbnailUrl: "/images/thumb-prayer.jpg",
      isAnonymous: true,
      status: "approved",
      prayerCount: 91,
      amenCount: 156,
      viewCount: 678,
    },
    {
      userId: null,
      title: "God Provided a Home When We Were Homeless",
      content:
        "After fleeing an abusive situation with my two children, we ended up in a shelter with nowhere to go. I had no job, no savings, and no family nearby. Every night I prayed over my sleeping children that God would provide. Within two weeks, a woman from a local church offered us her basement apartment rent-free for six months while I got back on my feet. She became family. Today I have my own apartment, a steady job, and my children are thriving. God's provision showed up through the hands of His people.",
      category: "family",
      type: "text",
      thumbnailUrl: "/images/thumb-family.jpg",
      isAnonymous: true,
      status: "approved",
      prayerCount: 73,
      amenCount: 112,
      viewCount: 445,
    },
    {
      userId: null,
      title: "Miraculous Healing of My Daughter's Rare Condition",
      content:
        "My 7-year-old daughter was diagnosed with a rare autoimmune condition that doctors said had no cure. She was in constant pain and losing weight rapidly. Our entire church fasted and prayed for 21 days. We took her for a follow-up scan expecting the worst, and the doctors were stunned — the inflammation was completely gone. They couldn't explain it. That was two years ago, and she has been perfectly healthy ever since. She just started soccer and is the most active kid on the team.",
      category: "healing",
      type: "video",
      mediaUrl: "/images/thumb-healing.jpg",
      thumbnailUrl: "/images/thumb-healing.jpg",
      isAnonymous: false,
      status: "approved",
      prayerCount: 128,
      amenCount: 234,
      viewCount: 892,
    },
    {
      userId: null,
      title: "From Skeptic to Believer: A Scientist's Journey to Faith",
      content:
        "I was a hardened skeptic and research scientist who dismissed faith as superstition. Then I had a personal experience during a meditation retreat that I couldn't explain through science. I started reading the Bible with a critical eye, expecting to debunk it. Instead, I found profound wisdom that answered questions my scientific training never could. Today I am a follower of Christ who sees science and faith as complementary, not contradictory. I lead a group for professionals wrestling with the same questions I had.",
      category: "general",
      type: "text",
      thumbnailUrl: "/images/thumb-career.jpg",
      isAnonymous: false,
      status: "approved",
      prayerCount: 44,
      amenCount: 87,
      viewCount: 367,
    },
  ]);

  // Seed Prayers
  await db.insert(prayers).values([
    {
      content:
        "Please pray for my mother who was just diagnosed with stage 2 breast cancer. We're believing for complete healing. She starts treatment next week and we're trusting God to guide the doctors' hands.",
      category: "healing",
      urgency: "high",
      isAnonymous: false,
      status: "active",
      prayerCount: 34,
    },
    {
      content:
        "I've been unemployed for 8 months and my savings are running out. I have two interviews this week. Please pray for favor and that the right opportunity opens up. I'm trying to stay faithful but it's getting harder each day.",
      category: "career",
      urgency: "high",
      isAnonymous: true,
      status: "active",
      prayerCount: 56,
    },
    {
      content:
        "My teenage son has been struggling with depression and anxiety. He's seeing a therapist but I can see he's still hurting. Please pray for his mental and emotional healing. Pray that he encounters God's love in a real way.",
      category: "family",
      urgency: "medium",
      isAnonymous: false,
      status: "active",
      prayerCount: 42,
    },
    {
      content:
        "I'm drowning in debt from medical bills after my surgery. The insurance didn't cover nearly what we expected. We need a financial miracle or wisdom to navigate this. Please pray for provision and peace.",
      category: "finance",
      urgency: "medium",
      isAnonymous: true,
      status: "active",
      prayerCount: 28,
    },
    {
      content:
        "After years of struggling with pornography addiction, I'm finally ready to be free. I've tried to stop on my own so many times and failed. I need prayer for strength, accountability, and complete deliverance. I'm tired of living in shame.",
      category: "deliverance",
      urgency: "medium",
      isAnonymous: true,
      status: "active",
      prayerCount: 67,
    },
    {
      content:
        "Praise report! My husband and I were trying to conceive for 4 years. We had two failed IVF cycles and were told we had less than 5% chance. We kept praying and believing. Last month we found out we're pregnant — naturally! The doctor called it a medical miracle. Baby is due in spring. Thank you to everyone who prayed with us!",
      category: "family",
      urgency: "low",
      isAnonymous: false,
      status: "answered",
      prayerCount: 156,
      answeredAt: new Date("2025-03-15"),
    },
    {
      content:
        "I'm preparing for my bar exam in two weeks. I've studied so hard but I'm having panic attacks about failing again (I failed once before). Please pray for peace, clarity of mind, and that I pass this time. My entire career depends on it.",
      category: "career",
      urgency: "medium",
      isAnonymous: false,
      status: "active",
      prayerCount: 19,
    },
    {
      content:
        "My elderly father is having hip replacement surgery tomorrow. He's 78 and we're nervous about the anesthesia and recovery. Please pray for a successful surgery, quick healing, and no complications. He's the pillar of our family.",
      category: "healing",
      urgency: "high",
      isAnonymous: false,
      status: "active",
      prayerCount: 45,
    },
  ]);

  // Seed Prayer Circles
  await db.insert(prayerCircles).values([
    {
      name: "Healing & Restoration Circle",
      description:
        "A safe space for those seeking physical, emotional, and spiritual healing. We pray together every Tuesday and Thursday evening.",
      category: "healing",
      isPublic: true,
      createdBy: 1,
      memberCount: 127,
    },
    {
      name: "Financial Breakthrough Group",
      description:
        "Join us as we pray for financial wisdom, debt freedom, and prosperity. We share testimonies of God's provision and practical financial tips.",
      category: "finance",
      isPublic: true,
      createdBy: 1,
      memberCount: 89,
    },
    {
      name: "Family Restoration Prayer",
      description:
        "For marriages, parent-child relationships, and family unity. We believe no family is beyond God's ability to restore.",
      category: "family",
      isPublic: true,
      createdBy: 1,
      memberCount: 156,
    },
    {
      name: "Purpose & Career Clarity",
      description:
        "Seeking direction in your career or calling? This circle prays for open doors, divine connections, and clarity of purpose.",
      category: "career",
      isPublic: true,
      createdBy: 1,
      memberCount: 74,
    },
  ]);

  // Seed Scheduled Prayers
  const now = new Date();
  await db.insert(scheduledPrayers).values([
    {
      title: "Evening Devotional Prayer",
      description:
        "Join us for a 30-minute guided prayer session focused on gratitude and reflection. Open to everyone.",
      hostId: 1,
      scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 30,
      isLive: true,
      participantCount: 23,
    },
    {
      title: "Midnight Prayer Watch",
      description:
        "A powerful hour of intercession. We pray for healing, deliverance, and breakthrough. Come expecting miracles.",
      hostId: 1,
      scheduledAt: new Date(now.getTime() + 8 * 60 * 60 * 1000), // 8 hours from now
      duration: 60,
      isLive: false,
      participantCount: 45,
    },
    {
      title: "Youth Prayer Gathering",
      description:
        "Young people coming together to pray for their generation. Topics include purity, purpose, and protection.",
      hostId: 1,
      scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 45,
      isLive: false,
      participantCount: 67,
    },
  ]);

  // Seed Forum Topics
  await db.insert(forumTopics).values([
    {
      title: "How do you maintain faith during long seasons of waiting?",
      content:
        "I've been praying for a breakthrough in my career for over two years now. Some days my faith is strong, other days I feel like giving up. How do you all stay encouraged when God's timing doesn't match your timeline? Would love to hear your strategies and testimonies.",
      category: "faith",
      userId: 1,
      replyCount: 12,
      viewCount: 156,
    },
    {
      title: "Navigating faith and mental health struggles",
      content:
        "As someone who deals with anxiety and depression, I sometimes hear people say 'just pray more' or 'have more faith.' While I believe in the power of prayer, I also believe God gave us therapists and medication. How do you balance spiritual warfare with practical mental health care?",
      category: "life",
      userId: 1,
      replyCount: 18,
      viewCount: 234,
    },
    {
      title: "Dating with purpose: Red flags and green flags",
      content:
        "For those who are married or in healthy relationships — what were the signs that let you know your partner was the one? And what red flags did you learn to recognize? I'm trying to approach dating with more wisdom this time around.",
      category: "relationships",
      userId: 1,
      replyCount: 24,
      viewCount: 312,
    },
    {
      title: "Career transition testimony and advice needed",
      content:
        "After 15 years in corporate marketing, I feel called to full-time ministry. But I have a family to support and a mortgage. Has anyone made a similar transition? How did you know it was the right time? What practical steps did you take?",
      category: "career",
      userId: 1,
      replyCount: 9,
      viewCount: 189,
    },
    {
      title: "Prayer request for our community outreach this weekend",
      content:
        "Our church is hosting a community feeding program this Saturday. We're expecting 300+ people. Please pray for enough food, volunteer energy, and most importantly, that people feel God's love through our service. We're also giving away free haircuts and job counseling.",
      category: "prayer",
      userId: 1,
      replyCount: 6,
      viewCount: 98,
      isPinned: true,
    },
  ]);

  // Seed Forum Replies
  await db.insert(forumReplies).values([
    {
      topicId: 1,
      userId: 1,
      content:
        "What helped me during my 3-year wait was keeping a prayer journal. Looking back at answered prayers reminded me that God had been faithful before. I also found that serving others during my waiting season gave me purpose and perspective. Hang in there!",
    },
    {
      topicId: 1,
      userId: 1,
      content:
        "I love what you said about the prayer journal. I started one too and it's been transformative. Also, worship music during my commute has become my daily faith anchor. When I don't feel like praying, I let the songs pray for me.",
    },
    {
      topicId: 2,
      userId: 1,
      content:
        "As a Christian therapist, I appreciate this question so much. Faith and therapy aren't mutually exclusive — they're complementary. God heals through many means. Taking medication for a chemical imbalance is no different than taking insulin for diabetes. Both are God's provision.",
    },
    {
      topicId: 3,
      userId: 1,
      content:
        "Green flag: They pray for you without you asking. Red flag: They isolate you from your community and family. The biggest thing I learned is to watch how they treat people who can do nothing for them — waiters, strangers, people in need.",
    },
    {
      topicId: 4,
      userId: 1,
      content:
        "I transitioned from finance to pastoral ministry. My advice: don't quit your day job until you have clarity AND provision. I started serving part-time for two years before making the leap. God will open the door when the time is right — but He also expects us to be wise stewards.",
    },
  ]);

  console.log("Seed data inserted successfully!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
