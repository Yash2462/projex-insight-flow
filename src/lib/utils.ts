import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(avatarUrl?: string, email?: string) {
  if (avatarUrl) {
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `http://localhost:8080${avatarUrl}`;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || 'user'}`;
}
