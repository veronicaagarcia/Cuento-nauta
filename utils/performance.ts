/**
 * Performance optimization utilities
 */

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Cache for API responses
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private maxAge: number;

  constructor(maxAgeMs = 5 * 60 * 1000) { // 5 minutes default
    this.maxAge = maxAgeMs;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new SimpleCache();

// Image loading optimization
export const optimizeImageUrl = (url?: string, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!url) return '';
  
  // Google Books image size parameters
  const sizeParams = {
    small: '&zoom=1',
    medium: '&zoom=2', 
    large: '&zoom=3'
  };
  
  // Ensure HTTPS
  const httpsUrl = url.replace(/^http:/, 'https:');
  
  return httpsUrl + sizeParams[size];
};

// Batch API requests to avoid rate limiting
export class BatchRequestManager {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly batchSize = 3;
  private readonly delay = 100; // ms between batches

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      await Promise.all(batch.map(request => request()));
      
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    this.processing = false;
  }
}

export const batchRequestManager = new BatchRequestManager();