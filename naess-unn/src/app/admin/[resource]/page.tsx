import { notFound } from "next/navigation";
import AdminCrud from "@/components/AdminCrud";
import { RESOURCES } from "@/lib/crud";
export default async function Page({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!RESOURCES[resource]) notFound();
  return <AdminCrud key={resource} name={resource} />;
}
