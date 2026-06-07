import { PrismaClient, Difficulty, Platform, SubjectName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@codexa.dev' },
    update: {},
    create: {
      name: 'Aarav Sharma',
      email: 'demo@codexa.dev',
      password: 'hashed-demo-password',
      targetRole: 'Full Stack Engineer',
      university: 'National Institute of Technology',
      bio: 'Preparing for software engineering interviews with a structured, analytics-first workflow.'
    }
  });

  await prisma.dsaTopic.createMany({
    data: [
      { userId: user.id, name: 'Arrays', category: 'Foundation', difficulty: Difficulty.EASY, completed: true, completion: 100, revisionCount: 4, notes: 'Sliding window practice complete.' },
      { userId: user.id, name: 'Trees', category: 'DSA', difficulty: Difficulty.MEDIUM, completion: 72, revisionCount: 2, weakSpot: false },
      { userId: user.id, name: 'Dynamic Programming', category: 'Advanced', difficulty: Difficulty.HARD, completion: 48, revisionCount: 1, weakSpot: true }
    ]
  });

  await prisma.codingProblem.createMany({
    data: [
      { userId: user.id, platform: Platform.LEETCODE, title: 'Longest Substring Without Repeating Characters', difficulty: Difficulty.MEDIUM, tags: ['string', 'hashmap'], timeTakenMin: 34, solved: true, revisionNeeded: true },
      { userId: user.id, platform: Platform.CODEFORCES, title: 'Two Pointers Sprint', difficulty: Difficulty.EASY, tags: ['greedy'], timeTakenMin: 21, solved: true },
      { userId: user.id, platform: Platform.HACKERRANK, title: 'Matrix Traversal', difficulty: Difficulty.MEDIUM, tags: ['matrix', 'implementation'], timeTakenMin: 46, solved: false, revisionNeeded: true }
    ]
  });

  await prisma.subjectProgress.createMany({
    data: [
      { userId: user.id, subject: SubjectName.DBMS, topic: 'Normalization and Indexing', completed: true, confidenceMeter: 82, revisionCount: 3 },
      { userId: user.id, subject: SubjectName.OS, topic: 'Deadlocks and Scheduling', completed: false, confidenceMeter: 64, revisionCount: 2 },
      { userId: user.id, subject: SubjectName.CN, topic: 'TCP/IP and Congestion Control', completed: false, confidenceMeter: 69, revisionCount: 1 },
      { userId: user.id, subject: SubjectName.OOPS, topic: 'Inheritance and Polymorphism', completed: true, confidenceMeter: 88, revisionCount: 2 }
    ]
  });

  await prisma.aptitudePerformance.createMany({
    data: [
      { userId: user.id, category: 'Quantitative Aptitude', accuracy: 86, speed: 72, mockScore: 79, attempted: 120, correct: 103 },
      { userId: user.id, category: 'Logical Reasoning', accuracy: 91, speed: 77, mockScore: 84, attempted: 96, correct: 88 },
      { userId: user.id, category: 'Verbal Ability', accuracy: 78, speed: 69, mockScore: 74, attempted: 80, correct: 62 }
    ]
  });

  await prisma.goal.createMany({
    data: [
      { userId: user.id, title: 'Reach 250 DSA problems', description: 'Focus on advanced patterns and revision loops.', progress: 71, status: 'active' },
      { userId: user.id, title: 'Complete CS core revisions', description: 'Finish DBMS, OS, CN, and OOPs interview notes.', progress: 58, status: 'active' }
    ]
  });

  await prisma.analyticsSnapshot.create({
    data: {
      userId: user.id,
      readinessScore: 84,
      totalSolved: 186,
      streak: 21,
      weeklyConsistency: 91,
      subjectRadar: { dsa: 82, coding: 79, aptitude: 74, core: 86, mock: 68 },
      heatmap: { mon: 4, tue: 3, wed: 5, thu: 4, fri: 5, sat: 2, sun: 1 }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });