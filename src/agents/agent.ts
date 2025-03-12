import { RunContextWrapper } from "./run_context";
import { ModelSettings } from "./model_settings";
import { Tool } from "./tool";
import { InputGuardrail, OutputGuardrail } from "./guardrail";
import { Handoff } from "./handoffs";
import { Model } from "./models/interface";
import { AgentHooks } from "./lifecycle";
import { RunResult } from "./result";
import { ItemHelpers } from "./items";

/**
 * Type for a function that can generate instructions dynamically
 */
export type InstructionsFunction<TContext> = (
  context: RunContextWrapper<TContext>,
  agent: Agent<TContext>
) => string | Promise<string>;

/**
 * Agent configuration options
 */
export interface AgentOptions<TContext> {
  name: string;
  instructions?: string | InstructionsFunction<TContext>;
  handoffDescription?: string;
  handoffs?: Array<Agent<unknown> | Handoff<TContext>>;
  model?: string | Model;
  modelSettings?: ModelSettings;
  tools?: Tool[];
  inputGuardrails?: InputGuardrail<TContext>[];
  outputGuardrails?: OutputGuardrail<TContext>[];
  outputType?: unknown;
  hooks?: AgentHooks<TContext>;
}

/**
 * An agent is an AI model configured with instructions, tools, guardrails, handoffs and more.
 *
 * We strongly recommend passing `instructions`, which is the "system prompt" for the agent. In
 * addition, you can pass `handoffDescription`, which is a human-readable description of the agent, used
 * when the agent is used inside tools/handoffs.
 *
 * Agents are generic on the context type. The context is a (mutable) object you create. It is
 * passed to tool functions, handoffs, guardrails, etc.
 */
export class Agent<TContext = unknown> {
  /**
   * The name of the agent.
   */
  readonly name: string;

  /**
   * The instructions for the agent. Will be used as the "system prompt" when this agent is
   * invoked. Describes what the agent should do, and how it responds.
   *
   * Can either be a string, or a function that dynamically generates instructions for the agent. If
   * you provide a function, it will be called with the context and the agent instance. It must
   * return a string.
   */
  readonly instructions?: string | InstructionsFunction<TContext>;

  /**
   * A description of the agent. This is used when the agent is used as a handoff, so that an
   * LLM knows what it does and when to invoke it.
   */
  readonly handoffDescription?: string;

  /**
   * Handoffs are sub-agents that the agent can delegate to. You can provide a list of handoffs,
   * and the agent can choose to delegate to them if relevant. Allows for separation of concerns and
   * modularity.
   */
  readonly handoffs: Array<Agent<unknown> | Handoff<TContext>>;

  /**
   * The model implementation to use when invoking the LLM.
   *
   * By default, if not set, the agent will use the default model configured in
   * `modelSettings.DEFAULT_MODEL`.
   */
  readonly model?: string | Model;

  /**
   * Configures model-specific tuning parameters (e.g. temperature, top_p).
   */
  readonly modelSettings: ModelSettings;

  /**
   * A list of tools that the agent can use.
   */
  readonly tools: Tool[];

  /**
   * A list of checks that run in parallel to the agent's execution, before generating a
   * response. Runs only if the agent is the first agent in the chain.
   */
  readonly inputGuardrails: InputGuardrail<TContext>[];

  /**
   * A list of checks that run on the final output of the agent, after generating a response.
   * Runs only if the agent produces a final output.
   */
  readonly outputGuardrails: OutputGuardrail<TContext>[];

  /**
   * The type of the output object. If not provided, the output will be `string`.
   */
  readonly outputType?: unknown;

  /**
   * A class that receives callbacks on various lifecycle events for this agent.
   */
  readonly hooks?: AgentHooks<TContext>;

  constructor(options: AgentOptions<TContext>) {
    this.name = options.name;
    this.instructions = options.instructions;
    this.handoffDescription = options.handoffDescription;
    this.handoffs = options.handoffs || [];
    this.model = options.model;
    this.modelSettings = options.modelSettings || new ModelSettings();
    this.tools = options.tools || [];
    this.inputGuardrails = options.inputGuardrails || [];
    this.outputGuardrails = options.outputGuardrails || [];
    this.outputType = options.outputType;
    this.hooks = options.hooks;
  }

  /**
   * Make a copy of the agent, with the given arguments changed. For example, you could do:
   * ```
   * const newAgent = agent.clone({ instructions: "New instructions" });
   * ```
   */
  clone(options: Partial<AgentOptions<TContext>>): Agent<TContext> {
    return new Agent({
      name: this.name,
      instructions: this.instructions,
      handoffDescription: this.handoffDescription,
      handoffs: this.handoffs,
      model: this.model,
      modelSettings: this.modelSettings,
      tools: this.tools,
      inputGuardrails: this.inputGuardrails,
      outputGuardrails: this.outputGuardrails,
      outputType: this.outputType,
      hooks: this.hooks,
      ...options,
    });
  }

  /**
   * Transform this agent into a tool, callable by other agents.
   *
   * This is different from handoffs in two ways:
   * 1. In handoffs, the new agent receives the conversation history. In this tool, the new agent
   *    receives generated input.
   * 2. In handoffs, the new agent takes over the conversation. In this tool, the new agent is
   *    called as a tool, and the conversation is continued by the original agent.
   *
   * @param toolName The name of the tool. If not provided, the agent's name will be used.
   * @param toolDescription The description of the tool, which should indicate what it does and
   *    when to use it.
   * @param customOutputExtractor A function that extracts the output from the agent. If not
   *    provided, the last message from the agent will be used.
   */
  asTool(
    toolName?: string,
    toolDescription?: string,
    customOutputExtractor?: (result: RunResult) => Promise<string>
  ): Tool {
    const name = toolName || transformStringFunctionStyle(this.name);
    const description = toolDescription || "";

    const runAgentTool: Tool = {
      name,
      description,
      paramsJsonSchema: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "The input to send to the agent",
          },
        },
        required: ["input"],
      },
      strictJsonSchema: true,
      onInvokeTool: async (
        context: RunContextWrapper<unknown>,
        input: string
      ): Promise<string> => {
        const params = JSON.parse(input);
        const { Runner } = await import("./run.js");

        const output = await Runner.run(this, params.input, {
          context: context.context,
        });

        if (customOutputExtractor) {
          return await customOutputExtractor(output);
        }

        return ItemHelpers.textMessageOutputs(output.newItems);
      },
    };

    return runAgentTool;
  }

  /**
   * Get the system prompt for the agent.
   */
  async getSystemPrompt(
    runContext: RunContextWrapper<TContext>
  ): Promise<string | null> {
    if (typeof this.instructions === "string") {
      return this.instructions;
    } else if (typeof this.instructions === "function") {
      return await this.instructions(runContext, this);
    } else if (this.instructions !== undefined) {
      console.error(
        `Instructions must be a string or a function, got ${typeof this.instructions}`
      );
    }

    return null;
  }
}

/**
 * Transform a string to function style (camelCase)
 */
function transformStringFunctionStyle(input: string): string {
  // Remove non-alphanumeric characters and convert to camelCase
  return input
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, "");
}
