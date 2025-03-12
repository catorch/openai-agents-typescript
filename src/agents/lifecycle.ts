import { RunContextWrapper } from './run_context';
import { TResponseInputItem } from './items';
import { Agent } from './agent';

/**
 * Hooks for agent lifecycle events
 */
export interface AgentHooks<TContext> {
  /**
   * Called before the agent is run
   * @param agent The agent being run
   * @param input The input to the agent
   * @param context The context of the run
   */
  beforeRun?(
    agent: Agent<TContext>,
    input: string | TResponseInputItem[],
    context: RunContextWrapper<TContext>
  ): Promise<void>;

  /**
   * Called after the agent is run
   * @param agent The agent being run
   * @param input The input to the agent
   * @param output The output from the agent
   * @param context The context of the run
   */
  afterRun?(
    agent: Agent<TContext>,
    input: string | TResponseInputItem[],
    output: unknown,
    context: RunContextWrapper<TContext>
  ): Promise<void>;

  /**
   * Called before a tool is invoked
   * @param agent The agent being run
   * @param toolName The name of the tool being invoked
   * @param toolInput The input to the tool
   * @param context The context of the run
   */
  beforeToolInvocation?(
    agent: Agent<TContext>,
    toolName: string,
    toolInput: string,
    context: RunContextWrapper<TContext>
  ): Promise<void>;

  /**
   * Called after a tool is invoked
   * @param agent The agent being run
   * @param toolName The name of the tool being invoked
   * @param toolInput The input to the tool
   * @param toolOutput The output from the tool
   * @param context The context of the run
   */
  afterToolInvocation?(
    agent: Agent<TContext>,
    toolName: string,
    toolInput: string,
    toolOutput: string,
    context: RunContextWrapper<TContext>
  ): Promise<void>;
}

/**
 * Hooks for run lifecycle events
 */
export interface RunHooks<TContext> {
  /**
   * Called before the run starts
   * @param input The input to the run
   * @param context The context of the run
   */
  beforeRun?(
    input: string | TResponseInputItem[],
    context: RunContextWrapper<TContext>
  ): Promise<void>;

  /**
   * Called after the run completes
   * @param input The input to the run
   * @param output The output from the run
   * @param context The context of the run
   */
  afterRun?(
    input: string | TResponseInputItem[],
    output: unknown,
    context: RunContextWrapper<TContext>
  ): Promise<void>;
} 