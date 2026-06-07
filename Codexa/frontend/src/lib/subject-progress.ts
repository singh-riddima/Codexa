export type ProgressStatus = 'todo' | 'attempted' | 'done';

export type ProgressRecord = {
  id: string;
  title: string;
  status: ProgressStatus | string;
  notes?: string | null;
};

export function makeProgressTitle(scope: string, title: string) {
  return `${scope}::${title}`;
}

export function isScopedTitle(title: string, scope: string) {
  return title.startsWith(`${scope}::`);
}

export function stripScope(title: string, scope: string) {
  return title.startsWith(`${scope}::`) ? title.slice(scope.length + 2) : title;
}

export function normalizeProgressStatus(status: string | undefined) {
  if (status === 'attempted') return 'attempted';
  if (status === 'done' || status === 'complete') return 'done';
  return 'todo';
}
