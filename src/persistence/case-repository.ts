/**
 * Purpose: Persist anonymous BenefitBridge case state behind a replaceable adapter.
 * Function: Uses DynamoDB when BENEFITBRIDGE_CASES_TABLE is configured and a
 * process-local repository otherwise, keeping local development deterministic.
 * Inputs/Outputs: Case IDs and CaseState records in; saved or restored records out.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { CaseState } from "../lib/types";

export interface CaseRepository {
  readonly mode: "memory" | "dynamodb";
  get(caseId: string): Promise<CaseState | null>;
  save(caseState: CaseState): Promise<void>;
}

export class MemoryCaseRepository implements CaseRepository {
  readonly mode = "memory" as const;
  private readonly cases = new Map<string, CaseState>();

  async get(caseId: string): Promise<CaseState | null> {
    const found = this.cases.get(caseId);
    console.info("[BenefitBridge][repository] Memory read completed", { caseId, found: Boolean(found) });
    return found ? structuredClone(found) : null;
  }

  async save(caseState: CaseState): Promise<void> {
    this.cases.set(caseState.id, structuredClone(caseState));
    console.info("[BenefitBridge][repository] Memory save completed", { caseId: caseState.id });
  }
}

export class DynamoDbCaseRepository implements CaseRepository {
  readonly mode = "dynamodb" as const;
  private readonly documentClient: DynamoDBDocumentClient;

  constructor(
    private readonly tableName: string,
    client = new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" })
  ) {
    this.documentClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true }
    });
    console.info("[BenefitBridge][repository] DynamoDB repository initialized", {
      tableName,
      region: process.env.AWS_REGION ?? "us-east-1"
    });
  }

  async get(caseId: string): Promise<CaseState | null> {
    try {
      const response = await this.documentClient.send(
        new GetCommand({ TableName: this.tableName, Key: { id: caseId }, ConsistentRead: true })
      );
      console.info("[BenefitBridge][repository] DynamoDB read completed", {
        caseId,
        found: Boolean(response.Item)
      });
      return (response.Item as CaseState | undefined) ?? null;
    } catch (error) {
      console.error("[BenefitBridge][repository] DynamoDB read failed", {
        caseId,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async save(caseState: CaseState): Promise<void> {
    try {
      await this.documentClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: caseState,
          ConditionExpression: "attribute_not_exists(id) OR updatedAt <= :updatedAt",
          ExpressionAttributeValues: { ":updatedAt": caseState.updatedAt }
        })
      );
      console.info("[BenefitBridge][repository] DynamoDB save completed", { caseId: caseState.id });
    } catch (error) {
      console.error("[BenefitBridge][repository] DynamoDB save failed", {
        caseId: caseState.id,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}

const defaultRepository: CaseRepository = process.env.BENEFITBRIDGE_CASES_TABLE
  ? new DynamoDbCaseRepository(process.env.BENEFITBRIDGE_CASES_TABLE)
  : new MemoryCaseRepository();

console.info("[BenefitBridge][repository] Default repository selected", { mode: defaultRepository.mode });

export function getCaseRepository(): CaseRepository {
  return defaultRepository;
}
