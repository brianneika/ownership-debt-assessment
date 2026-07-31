import '../../assessment/assessment-theme.css';
import { redirect } from 'next/navigation';
import { fetchSessionAnswers } from '@/lib/assessment';
import { computeTeaserEstimate, type TeaserAnswers } from '@/lib/teaser';
import { TeaserResult } from './TeaserResult';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Your preliminary read',
};

export default async function TeaserResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const answers = await fetchSessionAnswers(sessionId);

  // No teaser answers on this session → send them to take it.
  if (!answers.get('B001') && !answers.get('B002') && !answers.get('B003') && !answers.get('B004')) {
    redirect('/teaser');
  }

  const teaserAnswers: TeaserAnswers = {
    a006: answers.get('A006')?.text_value ?? null,
    b: {
      C: answers.get('B001')?.text_value ?? null,
      D: answers.get('B002')?.text_value ?? null,
      E: answers.get('B003')?.text_value ?? null,
      F: answers.get('B004')?.text_value ?? null,
    },
  };

  const estimate = computeTeaserEstimate(teaserAnswers);

  return (
    <div
      className="avai-scope min-h-screen flex items-center justify-center px-4 py-12 sm:py-16"
      style={{
        background: 'linear-gradient(145deg, var(--avai-canvas) 0%, var(--avai-accent-50) 100%)',
      }}
    >
      <div className="w-full max-w-lg">
        <TeaserResult sessionId={sessionId} estimate={estimate} />
      </div>
    </div>
  );
}
