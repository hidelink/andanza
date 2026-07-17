export type Accent = "teal" | "coral" | "amber";

export const accentClasses: Record<Accent, { bg: string; text: string }> = {
  teal: { bg: "bg-brand-teal-50", text: "text-brand-teal-600" },
  coral: { bg: "bg-brand-coral-50", text: "text-brand-coral-600" },
  amber: { bg: "bg-brand-amber-50", text: "text-brand-amber-600" },
};
