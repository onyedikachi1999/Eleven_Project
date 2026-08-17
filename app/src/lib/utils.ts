import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const clean = String(url).trim()
  if (!clean) return undefined
  
  // If relative path like /media/...
  if (clean.startsWith('/')) {
    const defaultBackend = (typeof window !== 'undefined' && (window.location.hostname.includes('onrender.com') || import.meta.env.PROD))
      ? 'https://eleven-backend-r9y1.onrender.com'
      : 'http://localhost:8000';
    const rawBase = import.meta.env.VITE_API_BASE_URL || defaultBackend;
    const cleanBase = rawBase.replace(/\/api\/?$/, '');
    const baseWithHttps = (cleanBase.startsWith('http://') && !cleanBase.includes('localhost') && !cleanBase.includes('127.0.0.1'))
      ? 'https://' + cleanBase.slice(7)
      : cleanBase;
    return `${baseWithHttps}${clean}`;
  }
  
  // Force https in production (unless localhost)
  if (clean.startsWith('http://') && !clean.includes('localhost') && !clean.includes('127.0.0.1')) {
    return 'https://' + clean.slice(7)
  }
  
  return clean
}

