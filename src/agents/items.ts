/**
 * Base interface for all run items
 */
export interface RunItem {
  /**
   * The ID of the item
   */
  id: string;
  
  /**
   * The type of the item
   */
  type: string;
}

/**
 * A text message in a conversation
 */
export interface TextMessage extends RunItem {
  type: 'text';
  
  /**
   * The role of the message sender (e.g., 'user', 'assistant')
   */
  role: string;
  
  /**
   * The content of the message
   */
  content: string;
}

/**
 * A tool call in a conversation
 */
export interface ToolCall extends RunItem {
  type: 'tool_call';
  
  /**
   * The name of the tool being called
   */
  name: string;
  
  /**
   * The input to the tool, as a JSON string
   */
  input: string;
}

/**
 * A tool response in a conversation
 */
export interface ToolResponse extends RunItem {
  type: 'tool_response';
  
  /**
   * The ID of the tool call this is responding to
   */
  toolCallId: string;
  
  /**
   * The output from the tool, as a string
   */
  output: string;
}

/**
 * A model response in a conversation
 */
export interface ModelResponse extends RunItem {
  type: 'model_response';
  
  /**
   * The content of the response
   */
  content: string;
  
  /**
   * Any tool calls made by the model
   */
  toolCalls?: ToolCall[];
}

/**
 * Union type for all possible response input items
 */
export type TResponseInputItem = TextMessage | ToolCall | ToolResponse;

/**
 * Helper functions for working with items
 */
export class ItemHelpers {
  /**
   * Create a unique ID
   */
  static createId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Create a text message
   */
  static createTextMessage(role: string, content: string): TextMessage {
    return {
      id: this.createId(),
      type: 'text',
      role,
      content
    };
  }
  
  /**
   * Create a tool call
   */
  static createToolCall(name: string, input: unknown): ToolCall {
    return {
      id: this.createId(),
      type: 'tool_call',
      name,
      input: typeof input === 'string' ? input : JSON.stringify(input)
    };
  }
  
  /**
   * Create a tool response
   */
  static createToolResponse(toolCallId: string, output: unknown): ToolResponse {
    return {
      id: this.createId(),
      type: 'tool_response',
      toolCallId,
      output: typeof output === 'string' ? output : JSON.stringify(output)
    };
  }
  
  /**
   * Create a model response
   */
  static createModelResponse(content: string, toolCalls?: ToolCall[]): ModelResponse {
    return {
      id: this.createId(),
      type: 'model_response',
      content,
      toolCalls
    };
  }
  
  /**
   * Extract text message outputs from a list of items
   */
  static textMessageOutputs(items: RunItem[]): string {
    // First filter to get only TextMessage items, then filter by role
    const textMessages = items
      .filter((item): item is TextMessage => item.type === 'text')
      .filter(item => item.role === 'assistant');
    
    if (textMessages.length === 0) {
      return '';
    }
    
    return textMessages[textMessages.length - 1].content;
  }
} 