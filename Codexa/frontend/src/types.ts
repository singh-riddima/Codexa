export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  targetRole?: string | null;
  university?: string | null;
  selectedSubjects?: string[];
  onboardingDuration?: string | null;
  onboardingIntensity?: string | null;
  onboardingCompleted?: boolean;
};

export type StatCardData = {
  label: string;
  value: string;
  delta?: string;
  tone?: 'brand' | 'success' | 'warning' | 'neutral';
};

export type TrackerModuleKey = 'dsa' | 'coding' | 'core' | 'aptitude';