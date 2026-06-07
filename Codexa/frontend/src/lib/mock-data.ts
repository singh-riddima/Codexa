import { BarChart3, BrainCircuit, Code2, Crown, Gauge, LineChart, Target, Trophy } from 'lucide-react';
import type { StatCardData, TrackerModuleKey } from '@/types';

export const landingStats = [
  { value: '10k+', label: 'students organized' },
  { value: '84%', label: 'avg. readiness uplift' },
  { value: '21d', label: 'streak improvement' },
  { value: '4.9/5', label: 'portfolio grade' }
];

export const landingFeatures = [
  { icon: Target, title: 'Placement cockpit', description: 'Track every layer of interview prep with one elegant command center.' },
  { icon: BrainCircuit, title: 'AI-ready architecture', description: 'Future-facing placeholders for recommendation engines and mock interview copilots.' },
  { icon: Gauge, title: 'Performance telemetry', description: 'Visualize consistency, weak topics, and readiness with live dashboard metrics.' },
  { icon: Crown, title: 'Premium product aesthetic', description: 'Glassmorphism panels, neon gradients, and motion-rich interactions throughout.' }
];

export const landingTestimonials = [
  { name: 'Meera, CSE final year', role: 'Placed at product startup', quote: 'Codexa made my prep feel measurable. I finally knew which topics needed attention.' },
  { name: 'Arjun, DS aspirant', role: 'Internship candidate', quote: 'The dashboard is the first thing I open every morning. It keeps me accountable.' },
  { name: 'Sana, placement batch lead', role: 'Interview squad mentor', quote: 'The UI looks like a startup product, and the analytics are genuinely useful.' }
];

export const pricingPlans = [
  { name: 'Starter', price: 'Free', description: 'For students who want structure without friction.', features: ['Core tracking', 'Basic analytics', 'Mobile responsive dashboard'] },
  { name: 'Pro', price: '$12', description: 'For serious interview prep with AI-first workflows.', features: ['Readiness score', 'Advanced charts', 'Goal planning', 'Resume analyzer placeholder'], featured: true },
  { name: 'Team', price: 'Custom', description: 'For placement cells, colleges, and student communities.', features: ['Cohort analytics', 'Mentor dashboards', 'Branded setup'] }
];

export const faqItems = [
  { question: 'Is Codexa only for technical interviews?', answer: 'No. It spans DSA, coding practice, core CS, aptitude, mock interviews, and resume preparation.' },
  { question: 'Does it support protected sessions?', answer: 'Yes. The app is wired for JWT authentication, persistent sessions, and protected routes.' },
  { question: 'Can I deploy it as a portfolio project?', answer: 'Yes. The architecture, visuals, and API structure are designed for internship and full-stack portfolios.' }
];

export const dashboardStats: StatCardData[] = [
  { label: 'Total Problems Solved', value: '186', delta: '+12 this week', tone: 'brand' },
  { label: 'DSA Completion', value: '78%', delta: '+6%', tone: 'success' },
  { label: 'Daily Streak', value: '21 days', delta: '3 missed days recovered', tone: 'warning' },
  { label: 'Readiness Score', value: '84/100', delta: 'Interview ready', tone: 'neutral' }
];

export const weeklySeries = [
  { day: 'Mon', solved: 4, study: 5, confidence: 62 },
  { day: 'Tue', solved: 6, study: 7, confidence: 66 },
  { day: 'Wed', solved: 5, study: 6, confidence: 70 },
  { day: 'Thu', solved: 7, study: 8, confidence: 73 },
  { day: 'Fri', solved: 9, study: 9, confidence: 77 },
  { day: 'Sat', solved: 3, study: 4, confidence: 75 },
  { day: 'Sun', solved: 2, study: 3, confidence: 78 }
];

export const radarData = [
  { subject: 'DSA', value: 82 },
  { subject: 'Coding', value: 79 },
  { subject: 'Core', value: 86 },
  { subject: 'Aptitude', value: 74 },
  { subject: 'Mock', value: 68 }
];

export const heatmapData = [
  { label: 'Arrays', value: 95 },
  { label: 'Strings', value: 82 },
  { label: 'Linked Lists', value: 76 },
  { label: 'Trees', value: 66 },
  { label: 'Graphs', value: 54 },
  { label: 'DP', value: 48 },
  { label: 'Greedy', value: 63 },
  { label: 'Backtracking', value: 39 }
];

export const moduleMeta: Record<TrackerModuleKey, { title: string; subtitle: string; accent: string; icon: typeof Code2; chips: string[]; metrics: StatCardData[] }> = {
  dsa: {
    title: 'DSA Tracker',
    subtitle: 'Track patterns, revision loops, and weak spots across interview-centric topics.',
    accent: 'from-violet-500 via-fuchsia-500 to-pink-500',
    icon: Code2,
    chips: ['Arrays', 'Strings', 'Trees', 'Graphs'],
    metrics: [
      { label: 'Topics completed', value: '6 / 8', delta: '2 pending revision' },
      { label: 'Weak topics', value: '2', delta: 'DP and Backtracking' },
      { label: 'Revision count', value: '14', delta: 'This month' }
    ]
  },
  coding: {
    title: 'Coding Practice',
    subtitle: 'Log every problem solved across LeetCode, Codeforces, and HackerRank.',
    accent: 'from-cyan-500 via-sky-500 to-indigo-500',
    icon: LineChart,
    chips: ['LeetCode', 'Codeforces', 'HackerRank'],
    metrics: [
      { label: 'Problems logged', value: '186', delta: '42 revision needed' },
      { label: 'Avg time', value: '32m', delta: 'Down 6m' },
      { label: 'Solve rate', value: '81%', delta: '+5% this week' }
    ]
  },
  core: {
    title: 'Core Subjects',
    subtitle: 'Build interview confidence in DBMS, OS, CN, and OOPs with revision tracking.',
    accent: 'from-emerald-500 via-teal-500 to-cyan-500',
    icon: Trophy,
    chips: ['DBMS', 'OS', 'CN', 'OOPs'],
    metrics: [
      { label: 'Confidence meter', value: '79%', delta: 'Up 8%' },
      { label: 'Topics covered', value: '17', delta: '4 active revisits' },
      { label: 'Notes entries', value: '29', delta: 'Structured summaries' }
    ]
  },
  aptitude: {
    title: 'Aptitude Module',
    subtitle: 'Improve speed, accuracy, and mock test scores for placement assessment rounds.',
    accent: 'from-amber-500 via-orange-500 to-rose-500',
    icon: BarChart3,
    chips: ['Quant', 'Logical', 'Verbal'],
    metrics: [
      { label: 'Accuracy', value: '85%', delta: 'Across mocks' },
      { label: 'Speed', value: '72%', delta: 'Timed improvement' },
      { label: 'Mock score', value: '79/100', delta: 'Recent test' }
    ]
  }
};

export const sampleGoals = [
  { title: 'Finish 250 DSA problems', progress: 71, due: 'Aug 15' },
  { title: 'Revise core subjects', progress: 58, due: 'Jul 30' },
  { title: 'Improve mock interview score', progress: 44, due: 'Jul 18' }
];

export const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/dsa', label: 'DSA' },
  { to: '/coding', label: 'Coding' },
  { to: '/core-subjects', label: 'Core Subjects' },
  { to: '/aptitude', label: 'Aptitude' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' }
];