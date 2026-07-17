export function Badge({
  tone,
  children,
}: {
  tone: "success" | "warning";
  children: React.ReactNode;
}) {
  const toneClasses =
    tone === "success"
      ? "bg-brand-teal-50 text-brand-teal-800"
      : "bg-brand-amber-50 text-brand-amber-800";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${toneClasses}`}
    >
      {children}
    </span>
  );
}
