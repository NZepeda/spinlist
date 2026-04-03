import type { LogContext } from "@/server/logging/serverLogger";
import { logServerInfo, logServerWarning } from "@/server/logging/serverLogger";

type WorkflowStage = "rejected" | "started" | "succeeded";

interface LogWorkflowParams {
  context?: LogContext;
  event: string;
  stage: WorkflowStage;
  workflow: string;
}

/**
 * Records a structured lifecycle log for a high-impact server workflow.
 *
 * @param params - The workflow event metadata.
 */
export function logWorkflow({
  context,
  event,
  stage,
  workflow,
}: LogWorkflowParams): void {
  const workflowContext: LogContext = {
    ...context,
    stage,
    workflow,
  };

  if (stage === "rejected") {
    logServerWarning({
      context: workflowContext,
      event,
    });
    return;
  }

  logServerInfo({
    context: workflowContext,
    event,
  });
}
