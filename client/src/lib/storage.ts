/**
 * LocalStorage utilities for save/resume functionality
 * Addresses P1 issue: no save/resume capability
 */

const STORAGE_KEY = 'bcs_calculator_data';
const STORAGE_TIMESTAMP_KEY = 'bcs_calculator_timestamp';

export interface StoredCalculatorData {
  inputs: any;
  timestamp: number;
}

export function saveCalculatorData(inputs: any): void {
  try {
    const data: StoredCalculatorData = {
      inputs,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, data.timestamp.toString());
  } catch (error) {
    console.error('Failed to save calculator data:', error);
  }
}

export function loadCalculatorData(): StoredCalculatorData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data: StoredCalculatorData = JSON.parse(stored);
    
    // Check if data is older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (data.timestamp < thirtyDaysAgo) {
      clearCalculatorData();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load calculator data:', error);
    return null;
  }
}

export function clearCalculatorData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Failed to clear calculator data:', error);
  }
}

export function getLastSavedTimestamp(): Date | null {
  try {
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    if (!timestamp) return null;
    return new Date(parseInt(timestamp));
  } catch (error) {
    return null;
  }
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}
