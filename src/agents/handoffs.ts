import { RunContextWrapper } from './run_context';
import { TResponseInputItem } from './items';
import { Agent } from './agent';

/**
 * A function that filters the input to a handoff
 */
export type HandoffInputFilter<TContext> = (
  input: TResponseInputItem[],
  context: RunContextWrapper<TContext>
) => Promise<TResponseInputItem[]>;

/**
 * Options for creating a handoff
 */
export interface HandoffOptions<TContext> {
  /**
   * The agent to hand off to
   */
  agent: Agent<TContext>;
  
  /**
   * A description of when to use this handoff
   */
  description: string;
  
  /**
   * A function that filters the input to the handoff
   */
  inputFilter?: HandoffInputFilter<TContext>;
}

/**
 * A handoff to another agent
 */
export class Handoff<TContext> {
  /**
   * The agent to hand off to
   */
  readonly agent: Agent<TContext>;
  
  /**
   * A description of when to use this handoff
   */
  readonly description: string;
  
  /**
   * A function that filters the input to the handoff
   */
  readonly inputFilter?: HandoffInputFilter<TContext>;
  
  constructor(options: HandoffOptions<TContext>) {
    this.agent = options.agent;
    this.description = options.description;
    this.inputFilter = options.inputFilter;
  }
}

/**
 * Create a handoff to another agent
 */
export function handoff<TContext>(
  agent: Agent<TContext>,
  description: string,
  inputFilter?: HandoffInputFilter<TContext>
): Handoff<TContext> {
  return new Handoff({
    agent,
    description,
    inputFilter
  });
} 