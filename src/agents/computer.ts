/**
 * Environment types for computer control
 */
export type Environment = 'mac' | 'windows' | 'ubuntu' | 'browser';

/**
 * Mouse button types
 */
export type Button = 'left' | 'right' | 'wheel' | 'back' | 'forward';

/**
 * Interface for a computer that can be controlled by an agent.
 * The Computer interface abstracts the operations needed to control a computer or browser.
 */
export interface Computer {
  /**
   * The environment the computer is running in
   */
  readonly environment: Environment;

  /**
   * The dimensions of the screen (width, height)
   */
  readonly dimensions: [number, number];

  /**
   * Take a screenshot of the current state of the computer
   * @returns A string representation of the screenshot (usually a base64-encoded image)
   */
  screenshot(): string;
  
  /**
   * Click at the specified coordinates with the specified button
   * @param x The x coordinate
   * @param y The y coordinate
   * @param button The button to click with
   */
  click(x: number, y: number, button: Button): void;
  
  /**
   * Double-click at the specified coordinates
   * @param x The x coordinate
   * @param y The y coordinate
   */
  doubleClick(x: number, y: number): void;
  
  /**
   * Scroll at the specified coordinates
   * @param x The x coordinate
   * @param y The y coordinate
   * @param scrollX The amount to scroll horizontally
   * @param scrollY The amount to scroll vertically
   */
  scroll(x: number, y: number, scrollX: number, scrollY: number): void;
  
  /**
   * Type the specified text
   * @param text The text to type
   */
  type(text: string): void;
  
  /**
   * Wait for a short period of time
   */
  wait(): void;
  
  /**
   * Move the cursor to the specified coordinates
   * @param x The x coordinate
   * @param y The y coordinate
   */
  move(x: number, y: number): void;
  
  /**
   * Press the specified keys
   * @param keys The keys to press
   */
  keypress(keys: string[]): void;
  
  /**
   * Drag the cursor along the specified path
   * @param path The path to drag along, as a list of (x, y) coordinates
   */
  drag(path: [number, number][]): void;
}

/**
 * Interface for an asynchronous computer that can be controlled by an agent.
 * The AsyncComputer interface abstracts the operations needed to control a computer or browser.
 */
export interface AsyncComputer {
  /**
   * The environment the computer is running in
   */
  readonly environment: Environment;

  /**
   * The dimensions of the screen (width, height)
   */
  readonly dimensions: [number, number];

  /**
   * Take a screenshot of the current state of the computer
   * @returns A string representation of the screenshot (usually a base64-encoded image)
   */
  screenshot(): Promise<string>;
  
  /**
   * Click at the specified coordinates with the specified button
   * @param x The x coordinate
   * @param y The y coordinate
   * @param button The button to click with
   */
  click(x: number, y: number, button: Button): Promise<void>;
  
  /**
   * Double-click at the specified coordinates
   * @param x The x coordinate
   * @param y The y coordinate
   */
  doubleClick(x: number, y: number): Promise<void>;
  
  /**
   * Scroll at the specified coordinates
   * @param x The x coordinate
   * @param y The y coordinate
   * @param scrollX The amount to scroll horizontally
   * @param scrollY The amount to scroll vertically
   */
  scroll(x: number, y: number, scrollX: number, scrollY: number): Promise<void>;
  
  /**
   * Type the specified text
   * @param text The text to type
   */
  type(text: string): Promise<void>;
  
  /**
   * Wait for a short period of time
   */
  wait(): Promise<void>;
  
  /**
   * Move the cursor to the specified coordinates
   * @param x The x coordinate
   * @param y The y coordinate
   */
  move(x: number, y: number): Promise<void>;
  
  /**
   * Press the specified keys
   * @param keys The keys to press
   */
  keypress(keys: string[]): Promise<void>;
  
  /**
   * Drag the cursor along the specified path
   * @param path The path to drag along, as a list of (x, y) coordinates
   */
  drag(path: [number, number][]): Promise<void>;
} 