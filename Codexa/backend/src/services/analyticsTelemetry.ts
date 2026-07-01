type DsaTopicLike = {
  completed: boolean;
  createdAt: Date;
};

type CodingProblemLike = {
  solved: boolean;
  submissionDate: Date;
};

type SubjectProgressLike = {
  subject: string;
  completed: boolean;
};

type AptitudePerformanceLike = {
  accuracy: number;
  mockScore: number;
  takenAt: Date;
};

type GoalLike = {
  progress: number;
  createdAt: Date;
};

type SnapshotLike = {
  readinessScore: number;
  streak: number;
  weeklyConsistency: number;
};

type TelemetryInput = {
  topics: DsaTopicLike[];
  problems: CodingProblemLike[];
  subjects: SubjectProgressLike[];
  aptitude: AptitudePerformanceLike[];
  goals: GoalLike[];
  snapshot?: SnapshotLike | null;
};

type TimeSeriesPoint = { day: string; solved: number; study: number; confidence: number };
type RadarPoint = { subject: string; value: number };
type HeatmapPoint = { label: string; value: number };

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateAtOffset(daysBack: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysBack);
  return date;
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function buildTelemetry(input: TelemetryInput) {
  const totalSolved = input.problems.filter((problem) => problem.solved).length;
  const dsaCompletion = percent(input.topics.filter((topic) => topic.completed).length, input.topics.length);

  const subjectGroups = new Map<string, { completed: number; total: number }>();
  for (const subject of input.subjects) {
    const entry = subjectGroups.get(subject.subject) ?? { completed: 0, total: 0 };
    entry.total += 1;
    if (subject.completed) entry.completed += 1;
    subjectGroups.set(subject.subject, entry);
  }

  const coreCompletion = subjectGroups.size
    ? Math.round(Array.from(subjectGroups.values()).reduce((sum, group) => sum + percent(group.completed, group.total), 0) / subjectGroups.size)
    : 0;

  const codingSolveRate = percent(totalSolved, input.problems.length);
  const aptitudeAverage = input.aptitude.length
    ? Math.round(input.aptitude.reduce((sum, entry) => sum + ((entry.accuracy + entry.mockScore) / 2), 0) / input.aptitude.length)
    : 0;
  const readinessScore = input.snapshot?.readinessScore ?? Math.round((dsaCompletion + codingSolveRate + coreCompletion + aptitudeAverage) / 4);
  const weeklyConsistency = input.snapshot?.weeklyConsistency ?? Math.max(0, Math.min(100, Math.round((codingSolveRate + dsaCompletion + coreCompletion) / 3)));
  const fallbackStreak = input.topics.length + input.problems.length > 0
    ? Math.min(30, Math.max(1, Math.round((input.topics.length + input.problems.length) / 4)))
    : 0;
  const dailyStreak = input.snapshot?.streak ?? fallbackStreak;

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => dateAtOffset(6 - index));
  const weeklySeries: TimeSeriesPoint[] = lastSevenDays.map((date, index) => {
    const key = toDateKey(date);
    const solved = input.problems.filter((problem) => problem.solved && toDateKey(problem.submissionDate) === key).length + input.topics.filter((topic) => topic.completed && toDateKey(topic.createdAt) === key).length;
    const study = input.topics.filter((topic) => toDateKey(topic.createdAt) === key).length + input.problems.filter((problem) => toDateKey(problem.submissionDate) === key).length + input.aptitude.filter((entry) => toDateKey(entry.takenAt) === key).length + input.goals.filter((goal) => toDateKey(goal.createdAt) === key).length;
    const confidenceBase = readinessScore - (6 - index) * 2 + solved * 3;

    return {
      day: weekdayLabels[date.getDay()],
      solved,
      study,
      confidence: Math.max(0, Math.min(100, Math.round(confidenceBase)))
    };
  });

  const heatmap: HeatmapPoint[] = Array.from(subjectGroups.entries())
    .map(([label, group]) => ({ label, value: percent(group.completed, group.total) }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 8);

  const radar: RadarPoint[] = [
    { subject: 'DSA', value: dsaCompletion },
    { subject: 'Coding', value: codingSolveRate },
    { subject: 'Core', value: coreCompletion },
    { subject: 'Aptitude', value: aptitudeAverage },
    { subject: 'Mock', value: input.snapshot?.readinessScore ?? Math.round((aptitudeAverage + codingSolveRate) / 2) }
  ];

  return {
    totalSolved,
    dsaCompletion,
    dailyStreak,
    weeklyConsistency,
    readinessScore,
    weeklySeries,
    heatmap,
    radar
  };
}