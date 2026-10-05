import { supabaseServer } from "@/lib/supabase/server";
import { Wrap, Empty, AlbumCard, Pager } from "@/components/Cards";
export const metadata = { title: "Memories & Gallery" };
export default async function Gallery({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 0); const sb = await supabaseServer();
  const { data } = await sb.from("gallery_albums").select("*").eq("status", "published").order("album_date", { ascending: false }).range(page * 12, page * 12 + 12);
  return <Wrap title="Memories & Gallery" intro="Photo albums from NAESS UNN activities.">{!data?.length ? <Empty t="No albums yet." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.slice(0, 12).map((a) => <AlbumCard key={a.id} a={a} />)}</div>}<Pager base="/gallery" page={page} more={(data?.length ?? 0) > 12} /></Wrap>;
}
