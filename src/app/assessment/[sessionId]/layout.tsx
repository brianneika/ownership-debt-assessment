import '../assessment-theme.css';
import { ProgressBar } from '@/components/assessment/ProgressBar';
import { SectionTransition } from '@/components/assessment/SectionTransition';

export default async function AssessmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sessionId: string }>;
}) {
  // Await params per Next.js 16 requirement
  await params;

  return (
    <div className="avai-scope min-h-screen flex flex-col">
      <ProgressBar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <SectionTransition>{children}</SectionTransition>
      </main>
    </div>
  );
}
