import { RunContextWrapper } from './run_context';
import { TResponseInputItem } from "./items"

/**
 * Result of an input guardrail check
 */
export interface InputGuardrailResult {
  /**
   * Whether the guardrail was triggered
   */
  triggered: boolean;
  
  /**
   * The reason the guardrail was triggered, if it was
   */
  reason?: string;
}

/**
 * Result of an output guardrail check
 */
export interface OutputGuardrailResult {
  /**
   * Whether the guardrail was triggered
   */
  triggered: boolean;
  
  /**
   * The reason the guardrail was triggered, if it was
   */
  reason?: string;
  
  /**
   * The modified output, if the guardrail modified it
   */
  modifiedOutput?: unknown;
}

/**
 * A guardrail that checks the input to an agent
 */
export interface InputGuardrail<TContext> {
  /**
   * Check the input to an agent
   * @param input The input to check
   * @param context The context of the run
   * @returns The result of the check
   */
  check(
    input: string | TResponseInputItem[],
    context: RunContextWrapper<TContext>
  ): Promise<InputGuardrailResult>;
}

/**
 * A guardrail that checks the output of an agent
 */
export interface OutputGuardrail<TContext> {
  /**
   * Check the output of an agent
   * @param output The output to check
   * @param context The context of the run
   * @returns The result of the check
   */
  check(
    output: unknown,
    context: RunContextWrapper<TContext>
  ): Promise<OutputGuardrailResult>;
} 