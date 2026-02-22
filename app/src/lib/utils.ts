import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 */
export function format(date: Date, formatStr: string = 'MMM dd, yyyy'): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return formatStr
    .replace('MMM', month)
    .replace('dd', day)
    .replace('yyyy', year.toString());
}
