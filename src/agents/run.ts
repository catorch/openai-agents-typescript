import { Agent } from './agent';
import { RunContextWrapper } from './run_context';
import { ModelSettings } from './model_settings';
import { RunResult } from './result';
import { ItemHelpers, TResponseInputItem } from './items';
import { OpenAIProvider } from './models/openai_provider';
import { Model, ModelProvider } from './models/interface';
import { DEFAULT_MODEL } from './model_settings';

/**
 * Configuration for a run
 */
export interface RunConfig {
  /**
   * The model to use for the run
   */
  model?: string | Model;

  /**
   * The model provider to use
   */
  modelProvider?: ModelProvider;

  /**
   * Model settings to use
   */
  modelSettings?: ModelSettings;

  /**
   * The context to use for the run
   */
  context?: unknown;

  /**
   * The maximum number of turns to run
   */
  maxTurns?: number;
}

/**
 * Default maximum number of turns
 */
const DEFAULT_MAX_TURNS = 10;

/**
 * Runner for executing agents
 */
export class Runner {
  /**
   * Run an agent with the given input
   * @param agent The agent to run
   * @param input The input to the agent
   * @param config Configuration for the run
   * @returns The result of the run
   */
  static async run<TContext = unknown>(
    agent: Agent<TContext>,
    input: string | TResponseInputItem[],
    config: RunConfig = {}
  ): Promise<RunResult> {
    // Create the context wrapper
    const context = new RunContextWrapper<TContext>(config.context as TContext);
    
    // Get the model provider
    const modelProvider = config.modelProvider || new OpenAIProvider();
    
    // Get the model
    const modelName = config.model || agent.model || DEFAULT_MODEL;
    const model = typeof modelName === 'string' ? modelProvider.getModel(modelName) : modelName;
    
    // Get the model settings
    const modelSettings = config.modelSettings 
      ? agent.modelSettings.merge(config.modelSettings)
      : agent.modelSettings;
    
    // Convert input to items if it's a string
    const inputItems = typeof input === 'string'
      ? [ItemHelpers.createTextMessage('user', input)]
      : input;
    
    // Get the system prompt
    const systemPrompt = await agent.getSystemPrompt(context);
    
    // Create the messages array
    const messages: TResponseInputItem[] = [];
    
    // Add the system prompt if it exists
    if (systemPrompt) {
      messages.push(ItemHelpers.createTextMessage('system', systemPrompt));
    }
    
    // Add the input items
    messages.push(...inputItems);
    
    // Run the agent
    const maxTurns = config.maxTurns || DEFAULT_MAX_TURNS;
    let currentTurn = 0;
    const allItems = [...messages];
    const newItems: TResponseInputItem[] = [];
    
    while (currentTurn < maxTurns) {
      currentTurn++;
      
      // Generate a response
      const response = await model.generate(messages, modelSettings);
      
      // Create a response item
      const responseItem = ItemHelpers.createTextMessage('assistant', response);
      
      // Add the response to the messages and items
      messages.push(responseItem);
      allItems.push(responseItem);
      newItems.push(responseItem);
      
      // Check if we need to continue
      if (!response.includes('tool_call:')) {
        // No tool calls, we're done
        break;
      }
      
      // TODO: Implement tool calling
      // For now, we'll just break
      break;
    }
    
    // Get the final output
    const finalOutput = ItemHelpers.textMessageOutputs(newItems);
    
    // Return the result
    return new RunResult({
      finalOutput,
      allItems,
      newItems,
      success: true
    });
  }
} 