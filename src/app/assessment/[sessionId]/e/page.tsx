import { WorkflowPage } from '@/components/assessment/WorkflowPage';

export default async function WorkflowEPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <WorkflowPage sessionId={sessionId} workflowKey="E" />;
}
