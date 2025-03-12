import OpenAI from 'openai';
import { Model, ModelProvider } from './interface';
import { ModelSettings } from '../model_settings';
import { TResponseInputItem, TextMessage, ToolCall, ToolResponse } from '../items';

/**
 * OpenAI model implementation
 */
export class OpenAIModel implements Model {
  private client: OpenAI;
  private modelName: string;

  /**
   * Create a new OpenAI model
   * @param client The OpenAI client
   * @param modelName The name of the model
   */
  constructor(client: OpenAI, modelName: string) {
    this.client = client;
    this.modelName = modelName;
  }

  /**
   * Convert our internal message format to OpenAI's format
   */
  private convertMessages(messages: TResponseInputItem[]): unknown[] {
    return messages.map(message => {
      if (message.type === 'text') {
        const textMessage = message as TextMessage;
        return {
          role: textMessage.role,
          content: textMessage.content
        };
      } else if (message.type === 'tool_call') {
        const toolCall = message as ToolCall;
        return {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: toolCall.id,
              type: 'function',
              function: {
                name: toolCall.name,
                arguments: toolCall.input
              }
            }
          ]
        };
      } else if (message.type === 'tool_response') {
        const toolResponse = message as ToolResponse;
        return {
          role: 'tool',
          content: toolResponse.output,
          tool_call_id: toolResponse.toolCallId
        };
      }
      
      throw new Error(`Unknown message type: ${(message as {type: string}).type}`);
    });
  }

  /**
   * Generate a response from the model
   */
  async generate(
    messages: TResponseInputItem[],
    settings: ModelSettings
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages: this.convertMessages(messages) as OpenAI.ChatCompletionMessageParam[],
      temperature: settings.temperature,
      top_p: settings.topP,
      max_tokens: settings.maxTokens,
      presence_penalty: settings.presencePenalty,
      frequency_penalty: settings.frequencyPenalty,
      stop: settings.stopSequences,
      seed: settings.seed
    });

    return response.choices[0].message.content || '';
  }

  /**
   * Generate a response from the model with streaming
   */
  async generateStreaming(
    messages: TResponseInputItem[],
    settings: ModelSettings,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const stream = await this.client.chat.completions.create({
      model: this.modelName,
      messages: this.convertMessages(messages) as OpenAI.ChatCompletionMessageParam[],
      temperature: settings.temperature,
      top_p: settings.topP,
      max_tokens: settings.maxTokens,
      presence_penalty: settings.presencePenalty,
      frequency_penalty: settings.frequencyPenalty,
      stop: settings.stopSequences,
      seed: settings.seed,
      stream: true
    });

    let fullResponse = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onChunk(content);
      }
    }
    
    return fullResponse;
  }
}

/**
 * OpenAI model provider
 */
export class OpenAIProvider implements ModelProvider {
  private client: OpenAI;
  private models: Map<string, OpenAIModel> = new Map();

  /**
   * Create a new OpenAI model provider
   * @param apiKey The OpenAI API key (optional, will use OPENAI_API_KEY env var if not provided)
   */
  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }

  /**
   * Get a model by name
   */
  getModel(modelName: string): Model {
    if (!this.models.has(modelName)) {
      this.models.set(modelName, new OpenAIModel(this.client, modelName));
    }
    
    return this.models.get(modelName)!;
  }
} 