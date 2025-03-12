import { RunContextWrapper } from './run_context';
import { Computer, AsyncComputer } from './computer';

/**
 * A tool that can be used by an agent
 */
export interface Tool {
  /**
   * The name of the tool, as shown to the LLM. Generally the name of the function.
   */
  name: string;

  /**
   * A description of the tool, as shown to the LLM.
   */
  description: string;

  /**
   * The JSON schema for the tool's parameters.
   */
  paramsJsonSchema: Record<string, unknown>;

  /**
   * A function that invokes the tool with the given context and parameters. The params passed
   * are:
   * 1. The tool run context.
   * 2. The arguments from the LLM, as a JSON string.
   *
   * You must return a string representation of the tool output. In case of errors, you can either
   * raise an Exception (which will cause the run to fail) or return a string error message (which
   * will be sent back to the LLM).
   */
  onInvokeTool: (context: RunContextWrapper<unknown>, input: string) => Promise<string>;

  /**
   * Whether the JSON schema is in strict mode. We **strongly** recommend setting this to true,
   * as it increases the likelihood of correct JSON input.
   */
  strictJsonSchema?: boolean;
}

/**
 * A hosted tool that lets the LLM search through a vector store. Currently only supported with
 * OpenAI models, using the Responses API.
 */
export interface FileSearchTool {
  /**
   * The name of the tool
   */
  name: string;

  /**
   * The IDs of the vector stores to search.
   */
  vectorStoreIds: string[];

  /**
   * The maximum number of results to return.
   */
  maxNumResults?: number;

  /**
   * Whether to include the search results in the output produced by the LLM.
   */
  includeSearchResults?: boolean;

  /**
   * Ranking options for search.
   */
  rankingOptions?: unknown;

  /**
   * A filter to apply based on file attributes.
   */
  filters?: unknown;
}

/**
 * A hosted tool that lets the LLM search the web. Currently only supported with OpenAI models,
 * using the Responses API.
 */
export interface WebSearchTool {
  /**
   * The name of the tool
   */
  name: string;

  /**
   * Optional location for the search. Lets you customize results to be relevant to a location.
   */
  userLocation?: unknown;

  /**
   * The amount of context to use for the search.
   */
  searchContextSize?: 'low' | 'medium' | 'high';
}

/**
 * A hosted tool that lets the LLM control a computer.
 */
export interface ComputerTool {
  /**
   * The name of the tool
   */
  name: string;

  /**
   * The computer implementation, which describes the environment and dimensions of the computer,
   * as well as implements the computer actions like click, screenshot, etc.
   */
  computer: Computer | AsyncComputer;
}

/**
 * Type for a function that handles tool errors
 */
export type ToolErrorFunction = (context: RunContextWrapper<unknown>, error: Error) => string;

/**
 * Default error handler for tools
 */
export function defaultToolErrorFunction(context: RunContextWrapper<unknown>, error: Error): string {
  return `Error: ${error.message}`;
}

/**
 * Create a tool from a function
 */
export function functionTool<T extends (...args: unknown[]) => unknown>(
  func: T,
  options: {
    nameOverride?: string;
    descriptionOverride?: string;
    failureErrorFunction?: ToolErrorFunction;
  } = {}
): Tool {
  const name = options.nameOverride || func.name;
  const description = options.descriptionOverride || '';
  const errorFunction = options.failureErrorFunction || defaultToolErrorFunction;

  // Create a JSON schema from the function parameters
  // This is a simplified version - in a real implementation, you would use
  // reflection or decorators to generate a proper JSON schema
  const paramsJsonSchema = {
    type: 'object',
    properties: {},
    required: []
  };

  const tool: Tool = {
    name,
    description,
    paramsJsonSchema,
    strictJsonSchema: true,
    onInvokeTool: async (context: RunContextWrapper<unknown>, input: string): Promise<string> => {
      try {
        const params = JSON.parse(input);
        
        // Call the function with the parameters
        const result = func(context, params);
        
        // Handle async functions
        if (result instanceof Promise) {
          return JSON.stringify(await result);
        }
        
        return JSON.stringify(result);
      } catch (error) {
        if (error instanceof Error) {
          return errorFunction(context, error);
        }
        return `Unknown error: ${error}`;
      }
    }
  };

  return tool;
} 