import { ModelSettings } from '../model_settings';
import { TResponseInputItem } from '../items';

/**
 * Interface for a model implementation
 */
export interface Model {
  /**
   * Generate a response from the model
   * @param messages The messages to generate a response from
   * @param settings The model settings to use
   * @returns The generated response
   */
  generate(
    messages: TResponseInputItem[],
    settings: ModelSettings
  ): Promise<string>;

  /**
   * Generate a response from the model with streaming
   * @param messages The messages to generate a response from
   * @param settings The model settings to use
   * @param onChunk A callback to call for each chunk of the response
   * @returns The generated response
   */
  generateStreaming(
    messages: TResponseInputItem[],
    settings: ModelSettings,
    onChunk: (chunk: string) => void
  ): Promise<string>;
}

/**
 * Interface for a model provider that can create models
 */
export interface ModelProvider {
  /**
   * Get a model by name
   * @param modelName The name of the model to get
   * @returns The model
   */
  getModel(modelName: string): Model;
} 