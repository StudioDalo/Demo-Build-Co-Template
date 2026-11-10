import type { ImageRef } from "./types";

/** Branded placeholder image: rendered as a labelled block, never as a fake photo. */
export function ph(label: string, alt?: string): ImageRef {
  return { placeholder: true, placeholderLabel: label, alt: alt ?? label };
}

/** Answer options from labels: value = slug of the label. */
export const opt = (labels: string[]) =>
  labels.map((label) => ({ value: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), label }));
