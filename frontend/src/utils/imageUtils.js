import { API_BASE_URL } from "../slices/axiosInstance";

const STATIC_BASE_URL = API_BASE_URL.replace("/api", "");

/**
 * Returns the full URL for an image path.
 * Handles both absolute (http/https) and relative paths.
 * @param {string} path - The image path or URL
 * @param {string} fallbackType - Type of fallback ('event' | 'user')
 * @returns {string} - The full URL
 */
export const getSafeImageUrl = (path, fallbackType = 'event', name = '') => {
  if (!path) {
    if (fallbackType === 'user') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=F97316&color=fff&bold=true`;
    }
    return null; // For events, we usually use a CSS placeholder if null
  }
  
  if (path.startsWith("http")) return path;
  
  // Clean path (remove leading slash if present)
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  
  return `${STATIC_BASE_URL}/${cleanPath}`;
};
