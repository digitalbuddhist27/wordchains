import { SiteHeader } from "@/components/SiteHeader";
import { RoomClient } from "@/components/RoomClient";

export const metadata = { title: "Room" };

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <RoomClient code={code.toUpperCase().slice(0, 4)} />
      </main>
    </>
  );
}
