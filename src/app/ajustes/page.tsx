import { getOrCreateShareToken } from "@/lib/shareToken";
import { ShareTokenCard } from "@/components/ShareTokenCard";

export default async function AjustesPage() {
  const token = await getOrCreateShareToken();

  return (
    <div>
      <p className="mb-4 text-base font-medium">Ajustes</p>
      <ShareTokenCard initialToken={token} />
    </div>
  );
}
