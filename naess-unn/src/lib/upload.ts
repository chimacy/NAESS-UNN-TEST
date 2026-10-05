import { supabaseBrowser } from "./supabase/client";
const IMG = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const DOC = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
async function resize(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1920 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/webp", 0.85));
  return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }) : file;
}
export async function uploadFile(file: File, folder = "uploads", kind: "image" | "doc" | "any" = "any") {
  const isImg = IMG.includes(file.type), isDoc = DOC.includes(file.type);
  if (kind === "image" && !isImg) throw new Error("Please choose a JPG, PNG, WebP or SVG image.");
  if (kind === "doc" && !isDoc) throw new Error("Please choose a PDF, Word or Excel file.");
  if (!isImg && !isDoc) throw new Error("This file type is not allowed.");
  if (file.size > 20 * 1024 * 1024) throw new Error("File is larger than 20 MB.");
  const f = isImg ? await resize(file) : file;
  const safe = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${folder}/${Date.now()}-${safe}`;
  const sb = supabaseBrowser();
  const up = await sb.storage.from("media").upload(path, f, { contentType: f.type });
  if (up.error) throw new Error(up.error.message);
  const url = sb.storage.from("media").getPublicUrl(path).data.publicUrl;
  const { data: { user } } = await sb.auth.getUser();
  await sb.from("media").insert({ path, url, filename: f.name, mime_type: f.type, size_bytes: f.size, uploaded_by: user?.id });
  return { url, name: f.name, type: f.type, size: f.size };
}
