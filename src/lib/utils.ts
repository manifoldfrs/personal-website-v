import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Uses UTC so publication dates do not depend on the server's local timezone. */
export function formatDate(dateString: string, month: "long" | "short" = "long") {
  return new Date(dateString).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month,
    day: "numeric",
  })
}
