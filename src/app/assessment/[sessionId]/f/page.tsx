import { WorkflowPage } from '@/components/assessment/WorkflowPage';

export default async function WorkflowFPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <WorkflowPage sessionId={sessionId} workflowKey="F" />;
}
