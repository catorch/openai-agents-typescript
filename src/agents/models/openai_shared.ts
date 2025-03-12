import OpenAI from 'openai';

let _defaultOpenAIKey: string | null = null;
let _defaultOpenAIClient: OpenAI | null = null;
let _useResponsesByDefault: boolean = true;

/**
 * Set the default OpenAI API key to use for all OpenAI models
 */
export function setDefaultOpenAIKey(key: string): void {
  _defaultOpenAIKey = key;
}

/**
 * Get the default OpenAI API key
 */
export function getDefaultOpenAIKey(): string | null {
  return _defaultOpenAIKey;
}

/**
 * Set the default OpenAI client to use for all OpenAI models
 */
export function setDefaultOpenAIClient(client: OpenAI): void {
  _defaultOpenAIClient = client;
}

/**
 * Get the default OpenAI client
 */
export function getDefaultOpenAIClient(): OpenAI | null {
  return _defaultOpenAIClient;
}

/**
 * Set whether to use the Responses API by default
 */
export function setUseResponsesByDefault(useResponses: boolean): void {
  _useResponsesByDefault = useResponses;
}

/**
 * Get whether to use the Responses API by default
 */
export function getUseResponsesByDefault(): boolean {
  return _useResponsesByDefault;
}

/**
 * Create a new OpenAI client with the given API key
 */
export function createOpenAIClient(apiKey?: string): OpenAI {
  const key = apiKey || _defaultOpenAIKey || process.env.OPENAI_API_KEY;
  
  if (!key) {
    throw new Error(
      "No OpenAI API key provided. Either pass an API key to createOpenAIClient, " +
      "call setDefaultOpenAIKey, or set the OPENAI_API_KEY environment variable."
    );
  }
  
  return new OpenAI({
    apiKey: key,
  });
}

/**
 * Get an OpenAI client, either the provided one, the default one, or create a new one
 */
export function getOpenAIClient(client?: OpenAI): OpenAI {
  if (client) {
    return client;
  }
  
  if (_defaultOpenAIClient) {
    return _defaultOpenAIClient;
  }
  
  return createOpenAIClient();
} 