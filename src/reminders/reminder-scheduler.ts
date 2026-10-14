/**
 * Purpose: Schedule and cancel BenefitBridge follow-up checks.
 * Function: Uses EventBridge Scheduler in AWS and a deterministic in-memory
 * adapter during local development and automated tests.
 * Inputs/Outputs: Anonymous case IDs in; scheduled timestamps or cancellation out.
 */
import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  SchedulerClient,
  UpdateScheduleCommand
} from "@aws-sdk/client-scheduler";

export interface ReminderScheduler {
  readonly mode: "memory" | "eventbridge";
  schedule(caseId: string): Promise<string>;
  cancel(caseId: string): Promise<void>;
}

function scheduleName(caseId: string): string {
  return `benefitbridge-${caseId.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`.slice(0, 64);
}

function nextFollowUp(now = new Date()): Date {
  const followUp = new Date(now);
  followUp.setUTCDate(followUp.getUTCDate() + 30);
  followUp.setUTCSeconds(0, 0);
  return followUp;
}

export class MemoryReminderScheduler implements ReminderScheduler {
  readonly mode = "memory" as const;
  private readonly schedules = new Map<string, string>();

  constructor(private readonly clock: () => Date = () => new Date()) {}

  async schedule(caseId: string): Promise<string> {
    const scheduledAt = nextFollowUp(this.clock()).toISOString();
    this.schedules.set(caseId, scheduledAt);
    console.info("[BenefitBridge][reminders] Memory reminder scheduled", { caseId, scheduledAt });
    return scheduledAt;
  }

  async cancel(caseId: string): Promise<void> {
    const deleted = this.schedules.delete(caseId);
    console.info("[BenefitBridge][reminders] Memory reminder cancelled", { caseId, deleted });
  }
}

export class EventBridgeReminderScheduler implements ReminderScheduler {
  readonly mode = "eventbridge" as const;
  private readonly client: SchedulerClient;

  constructor(
    private readonly targetArn: string,
    private readonly roleArn: string,
    private readonly groupName = process.env.BENEFITBRIDGE_SCHEDULE_GROUP ?? "benefitbridge",
    client = new SchedulerClient({ region: process.env.AWS_REGION ?? "us-east-1" })
  ) {
    this.client = client;
    console.info("[BenefitBridge][reminders] EventBridge Scheduler initialized", { groupName });
  }

  async schedule(caseId: string): Promise<string> {
    const scheduledAt = nextFollowUp().toISOString();
    const common = {
      Name: scheduleName(caseId),
      GroupName: this.groupName,
      ScheduleExpression: `at(${scheduledAt.slice(0, 19)})`,
      ScheduleExpressionTimezone: "UTC",
      FlexibleTimeWindow: { Mode: "OFF" as const },
      ActionAfterCompletion: "DELETE" as const,
      Target: {
        Arn: this.targetArn,
        RoleArn: this.roleArn,
        Input: JSON.stringify({ caseId, scheduledAt }),
        RetryPolicy: { MaximumEventAgeInSeconds: 3600, MaximumRetryAttempts: 2 }
      }
    };

    try {
      await this.client.send(new CreateScheduleCommand(common));
      console.info("[BenefitBridge][reminders] EventBridge reminder created", { caseId, scheduledAt });
    } catch (error) {
      if (error instanceof Error && error.name === "ConflictException") {
        await this.client.send(new UpdateScheduleCommand(common));
        console.info("[BenefitBridge][reminders] EventBridge reminder updated", { caseId, scheduledAt });
      } else {
        console.error("[BenefitBridge][reminders] EventBridge scheduling failed", {
          caseId,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    }
    return scheduledAt;
  }

  async cancel(caseId: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteScheduleCommand({ Name: scheduleName(caseId), GroupName: this.groupName })
      );
      console.info("[BenefitBridge][reminders] EventBridge reminder cancelled", { caseId });
    } catch (error) {
      if (error instanceof Error && error.name === "ResourceNotFoundException") {
        console.info("[BenefitBridge][reminders] EventBridge reminder already absent", { caseId });
        return;
      }
      console.error("[BenefitBridge][reminders] EventBridge cancellation failed", {
        caseId,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}

const targetArn = process.env.BENEFITBRIDGE_REMINDER_TARGET_ARN;
const roleArn = process.env.BENEFITBRIDGE_SCHEDULER_ROLE_ARN;
const defaultScheduler: ReminderScheduler = targetArn && roleArn
  ? new EventBridgeReminderScheduler(targetArn, roleArn)
  : new MemoryReminderScheduler();

console.info("[BenefitBridge][reminders] Default scheduler selected", { mode: defaultScheduler.mode });

export function getReminderScheduler(): ReminderScheduler {
  return defaultScheduler;
}
