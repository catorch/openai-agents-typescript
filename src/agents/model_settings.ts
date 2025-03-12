/**
 * Default model to use if none is specified
 */
export const DEFAULT_MODEL = 'gpt-4o';

/**
 * Configuration for model-specific parameters
 */
export class ModelSettings {
  /**
   * The temperature parameter for the model. Higher values make output more random, lower values make it more deterministic.
   */
  readonly temperature?: number;

  /**
   * The top_p parameter for the model. An alternative to temperature, sets the probability mass to consider.
   */
  readonly topP?: number;

  /**
   * The maximum number of tokens to generate.
   */
  readonly maxTokens?: number;

  /**
   * The presence penalty parameter. Positive values penalize tokens based on their existing presence.
   */
  readonly presencePenalty?: number;

  /**
   * The frequency penalty parameter. Positive values penalize tokens based on their frequency in the text so far.
   */
  readonly frequencyPenalty?: number;

  /**
   * The stop sequences parameter. The model will stop generating text when it encounters any of these sequences.
   */
  readonly stopSequences?: string[];

  /**
   * The seed parameter. If provided, the model will try to be deterministic.
   */
  readonly seed?: number;

  /**
   * Create a new model settings object
   */
  constructor(options: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stopSequences?: string[];
    seed?: number;
  } = {}) {
    this.temperature = options.temperature;
    this.topP = options.topP;
    this.maxTokens = options.maxTokens;
    this.presencePenalty = options.presencePenalty;
    this.frequencyPenalty = options.frequencyPenalty;
    this.stopSequences = options.stopSequences;
    this.seed = options.seed;
  }

  /**
   * Create a new model settings object with the given options merged with the current ones
   */
  merge(options: Partial<ModelSettings>): ModelSettings {
    return new ModelSettings({
      temperature: options.temperature ?? this.temperature,
      topP: options.topP ?? this.topP,
      maxTokens: options.maxTokens ?? this.maxTokens,
      presencePenalty: options.presencePenalty ?? this.presencePenalty,
      frequencyPenalty: options.frequencyPenalty ?? this.frequencyPenalty,
      stopSequences: options.stopSequences ?? this.stopSequences,
      seed: options.seed ?? this.seed,
    });
  }
} 