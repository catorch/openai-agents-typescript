/**
 * Generic type parameter for the context object
 */
export type TContext = unknown;

/**
 * A wrapper around a context object that provides additional functionality.
 * The context is a (mutable) object you create. It is passed to tool functions, handoffs, guardrails, etc.
 */
export class RunContextWrapper<T = TContext> {
  /**
   * The context object
   */
  readonly context: T;

  /**
   * Create a new run context wrapper
   * @param context The context object
   */
  constructor(context: T) {
    this.context = context;
  }
} 