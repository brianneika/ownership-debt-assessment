import '../../assessment/assessment-theme.css';
import { redirect } from 'next/navigation';
import { fetchSession, fetchSessionAnswers } from '@/lib/assessment';
import { computeTeaserEstimate, computeTeaserEstimateV2, type TeaserAnswers } from '@/lib/teaser';
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

  const [session, answers] = await Promise.all([fetchSession(sessionId), fetchSessionAnswers(sessionId)]);
  const v2 = session?.instrument_version === 2;

  // Owner rows and the two leader answers, by instrument version. v1 teaser
  // sessions started before v2 keep reading their v1 keys and v1 math.
  const k = v2
    ? { C: 'V2B_C', D: 'V2B_D', E: 'V2B_E', F: 'V2B_F', authority: 'V2G_DECISIONS', takeBack: 'V2G_MOVED' }
    : { C: 'B001', D: 'B002', E: 'B003', F: 'B004', authority: 'Q079', takeBack: 'Q074' };

  // No teaser answers on this session: send them to take it.
  if (!answers.get(k.C) && !answers.get(k.D) && !answers.get(k.E) && !answers.get(k.F)) {
    redirect('/teaser');
  }

  const teaserAnswers: TeaserAnswers = {
    b: {
      C: answers.get(k.C)?.text_value ?? null,
      D: answers.get(k.D)?.text_value ?? null,
      E: answers.get(k.E)?.text_value ?? null,
      F: answers.get(k.F)?.text_value ?? null,
    },
    authority: answers.get(k.authority)?.score_value ?? null,
    takeBack: answers.get(k.takeBack)?.score_value ?? null,
  };

  const estimate = v2 ? computeTeaserEstimateV2(teaserAnswers) : computeTeaserEstimate(teaserAnswers);

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
