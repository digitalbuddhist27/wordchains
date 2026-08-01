import { SiteHeader } from "@/components/SiteHeader";
import { OnlineLobbyEntry } from "@/components/OnlineLobbyEntry";

export const metadata = { title: "Play online" };

export default async function OnlinePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const sp = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-16 pt-6">
        <OnlineLobbyEntry initialCode={(sp.code ?? "").toUpperCase().slice(0, 4)} />
      </main>
    </>
  );
}
