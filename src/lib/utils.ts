import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Converts a string to title case
 */
export function titleCase(str: string) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Decodes HTML entities in a string (client-side version)
 * For example, converts &amp; to &, &#39; to ', &quot; to ", etc.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return "";

  // Only use the textarea approach on the client-side
  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }

  // Fallback for server-side use
  return serverDecodeHtmlEntities(text);
}

/**
 * Decodes HTML entities in a string (server-side version)
 * Works in both client and server environments
 */
export function serverDecodeHtmlEntities(text: string): string {
  if (!text) return "";

  // Handle the most common HTML entities
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}
