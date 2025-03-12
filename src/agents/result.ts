import { RunItem } from './items';

/**
 * The result of an agent run
 */
export class RunResult {
  /**
   * The final output of the run, as a string or structured object
   */
  readonly finalOutput: unknown;

  /**
   * All items generated during the run
   */
  readonly allItems: RunItem[];

  /**
   * New items generated during the run (not including input items)
   */
  readonly newItems: RunItem[];

  /**
   * Whether the run was successful
   */
  readonly success: boolean;

  /**
   * The error that occurred during the run, if unknown
   */
  readonly error?: Error;

  /**
   * Create a new run result
   */
  constructor(options: {
    finalOutput: unknown;
    allItems: RunItem[];
    newItems: RunItem[];
    success: boolean;
    error?: Error;
  }) {
    this.finalOutput = options.finalOutput;
    this.allItems = options.allItems;
    this.newItems = options.newItems;
    this.success = options.success;
    this.error = options.error;
  }
}

/**
 * A streaming run result that emits events as the run progresses
 */
export class RunResultStreaming extends RunResult {
  /**
   * A promise that resolves when the run is complete
   */
  readonly done: Promise<RunResult>;

  /**
   * Create a new streaming run result
   */
  constructor(options: {
    finalOutput: unknown;
    allItems: RunItem[];
    newItems: RunItem[];
    success: boolean;
    error?: Error;
    done: Promise<RunResult>;
  }) {
    super(options);
    this.done = options.done;
  }
} 