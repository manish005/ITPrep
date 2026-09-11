import { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(inputs.map((input) => typeof input === "string" ? input : "").filter(Boolean).join(" "));
}