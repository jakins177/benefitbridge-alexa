/**
 * Purpose: Convert natural speech into constrained intake answers and explain an
 * already-determined recovery plan in plain language.
 * Function: Uses Amazon Bedrock when configured and falls back to transparent,
 * deterministic parsing; it never decides benefit eligibility.
 * Inputs/Outputs: Intake utterances or verified recommendations in; normalized
 * answers or explanatory text out.
 */
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { normalizeAnswer } from "../lib/intake";
import { z } from "zod";
import type { IntakeStep, ProgramRecommendation } from "../lib/types";

export interface IntakeInterpretation {
  answer: string;
  explanation: string;
  source: "bedrock" | "deterministic";
}

export interface PlanExplanation {
  explanation: string;
  source: "bedrock" | "deterministic";
}

export interface ConversationAssistant {
  interpret(step: IntakeStep, utterance: string): Promise<IntakeInterpretation>;
  explain(recommendations: ProgramRecommendation[]): Promise<PlanExplanation>;
}

const interpretationSchema = z.object({
  answer: z.string().min(1).max(200),
  explanation: z.string().min(1).max(500)
});

export class DeterministicConversationAssistant implements ConversationAssistant {
  async interpret(step: IntakeStep, utterance: string): Promise<IntakeInterpretation> {
    const answer = normalizeAnswer(step, utterance);
    console.info("[BenefitBridge][conversation] Interpretation completed", { step });
    return { answer, explanation: "Please confirm the interpreted answer.", source: "deterministic" };
  }

  async explain(recommendations: ProgramRecommendation[]): Promise<PlanExplanation> {
    if (recommendations.length === 0) throw new Error("Complete the intake before requesting a plan explanation.");
    const ordered = [...recommendations].sort((a, b) => a.priority - b.priority);
    const immediate = ordered.filter(({ status }) => status !== "monitor");
    const monitored = ordered.filter(({ status }) => status === "monitor");
    const explanation = [
      `Your first ${immediate.length === 1 ? "action is" : `${immediate.length} actions are`} ${immediate.map(({ shortName }) => shortName).join(", ")}.`,
      monitored.length ? `Keep ${monitored.map(({ shortName }) => shortName).join(", ")} on your watch list.` : "",
      "These are official screening paths, not eligibility decisions."
    ].filter(Boolean).join(" ");
    return { explanation, source: "deterministic" };
  }
}

export class BedrockConversationAssistant implements ConversationAssistant {
  private readonly fallback = new DeterministicConversationAssistant();

  constructor(
    private readonly modelId: string,
    private readonly client = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? "us-east-1" })
  ) {
    console.info("[BenefitBridge][conversation] Bedrock assistant initialized", { modelId });
  }

  private async converse(prompt: string, maxTokens: number): Promise<string> {
    const response = await this.client.send(new ConverseCommand({
      modelId: this.modelId,
      system: [{ text: "You are BenefitBridge's language layer. Never decide eligibility. Never change program rules. Follow the requested output format exactly." }],
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens, temperature: 0 }
    }));
    const text = response.output?.message?.content?.find((part) => "text" in part)?.text;
    if (!text) throw new Error("Bedrock returned no text content.");
    console.info("[BenefitBridge][conversation] Bedrock response received", {
      modelId: this.modelId,
      inputTokens: response.usage?.inputTokens,
      outputTokens: response.usage?.outputTokens
    });
    return text;
  }

  async interpret(step: IntakeStep, utterance: string): Promise<IntakeInterpretation> {
    // Deterministic recognition must succeed first: never let a model guess missing facts.
    const validated = await this.fallback.interpret(step, utterance);
    try {
      const text = await this.converse(
        `Current intake step: ${step}. User utterance: ${JSON.stringify(utterance)}. Return JSON only: {"answer":"normalized answer","explanation":"brief confirmation"}. Allowed answers: crisis=lost-job; household=integer 1-20; income=non-negative whole dollars; children/coverage/energy=yes or no.`,
        160
      );
      const parsed = interpretationSchema.parse(JSON.parse(text.replace(/^```json\s*|\s*```$/g, "")));
      console.info("[BenefitBridge][conversation] Bedrock intake interpretation completed", { step });
      if (normalizeAnswer(step, parsed.answer) !== validated.answer) throw new Error("Language interpretation disagreed with validated answer.");
      return { ...parsed, answer: validated.answer, source: "bedrock" };
    } catch (error) {
      console.error("[BenefitBridge][conversation] Bedrock interpretation failed; using deterministic fallback", {
        step,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return this.fallback.interpret(step, utterance);
    }
  }

  async explain(recommendations: ProgramRecommendation[]): Promise<PlanExplanation> {
    try {
      const facts = recommendations.map(({ shortName, statusLabel, reason, nextStep }) => ({ shortName, statusLabel, reason, nextStep }));
      const explanation = await this.converse(
        `Explain this already-determined recovery plan in at most 90 words with calm, direct language. Do not add programs, thresholds, promises, or eligibility claims. End by saying agencies make final decisions. Plan: ${JSON.stringify(facts)}`,
        180
      );
      return { explanation: explanation.trim(), source: "bedrock" };
    } catch (error) {
      console.error("[BenefitBridge][conversation] Bedrock explanation failed; using deterministic fallback", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return this.fallback.explain(recommendations);
    }
  }
}

const modelId = process.env.BENEFITBRIDGE_BEDROCK_MODEL_ID;
const defaultAssistant: ConversationAssistant = modelId
  ? new BedrockConversationAssistant(modelId)
  : new DeterministicConversationAssistant();

console.info("[BenefitBridge][conversation] Default assistant selected", {
  mode: modelId ? "bedrock-with-fallback" : "deterministic"
});

export function getConversationAssistant(): ConversationAssistant {
  return defaultAssistant;
}
