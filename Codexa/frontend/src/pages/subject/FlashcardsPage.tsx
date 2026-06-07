import { useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

export default function FlashcardsPage() {
  const { subjectKey } = useParams();
  return (
    <AppShell>
      <div className="py-8">
        <h1 className="text-2xl font-semibold">{subjectKey} — Flashcards</h1>
        <p className="text-sm text-white/60 mt-2">Create and review flashcards for active topics.</p>
      </div>
    </AppShell>
  );
}
