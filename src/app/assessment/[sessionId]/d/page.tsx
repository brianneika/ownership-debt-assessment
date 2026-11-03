import { WorkflowPage } from '@/components/assessment/WorkflowPage';

export default async function WorkflowDPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <WorkflowPage sessionId={sessionId} workflowKey="D" />;
}
