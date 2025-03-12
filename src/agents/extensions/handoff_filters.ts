import { RunItem, TResponseInputItem } from '../items';

/**
 * Interface for handoff input data
 */
export interface HandoffInputData {
  inputHistory: TResponseInputItem[] | unknown;
  preHandoffItems: RunItem[];
  newItems: RunItem[];
}

/**
 * Contains common handoff input filters, for convenience.
 */

/**
 * Filters out all tool items: file search, web search and function calls+output.
 */
export function removeAllTools(handoffInputData: HandoffInputData): HandoffInputData {
  const { inputHistory, preHandoffItems, newItems } = handoffInputData;

  const filteredHistory = Array.isArray(inputHistory) 
    ? removeToolTypesFromInput(inputHistory as TResponseInputItem[]) 
    : inputHistory;
  
  const filteredPreHandoffItems = removeToolsFromItems(preHandoffItems);
  const filteredNewItems = removeToolsFromItems(newItems);

  return {
    inputHistory: filteredHistory,
    preHandoffItems: filteredPreHandoffItems,
    newItems: filteredNewItems,
  };
}

/**
 * Helper function to remove tool items from an array of RunItems
 */
function removeToolsFromItems(items: RunItem[]): RunItem[] {
  return items.filter(item => 
    !(item.type === 'tool_call' || 
      item.type === 'tool_response' || 
      item.type === 'handoff_call' || 
      item.type === 'handoff_output')
  );
}

/**
 * Helper function to remove tool types from input items
 */
function removeToolTypesFromInput(items: TResponseInputItem[]): TResponseInputItem[] {
  const toolTypes = [
    'function_call',
    'function_call_output',
    'computer_call',
    'computer_call_output',
    'file_search_call',
    'web_search_call',
    'tool_call',
    'tool_response'
  ];

  return items.filter(item => !toolTypes.includes(item.type));
} 