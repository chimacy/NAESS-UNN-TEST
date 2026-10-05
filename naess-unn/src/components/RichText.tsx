"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { uploadFile } from "@/lib/upload";
export default function RichText({ value, onChange }: { value: string; onChange: (h: string) => void }) {
  const ed = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false }), Image, TextAlign.configure({ types: ["heading", "paragraph"] }), Table, TableRow, TableHeader, TableCell],
    content: value || "", immediatelyRender: false,
    editorProps: { attributes: { class: "prose-naess min-h-[220px] p-3 focus:outline-none", "aria-label": "Rich text editor" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!ed) return <div className="h-40 animate-pulse rounded bg-stone-100" />;
  const B = (l: string, t: string, on: boolean, run: () => void) => (
    <button type="button" title={t} aria-label={t} aria-pressed={on} onClick={run} className={`min-h-[36px] min-w-[36px] rounded px-2 text-sm ${on ? "bg-primary text-white" : "bg-white hover:bg-stone-100"}`}>{l}</button>);
  const c = () => ed.chain().focus();
  async function img(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    try { const r = await uploadFile(f, "content", "image"); const alt = prompt("Describe this image (alt text):") || ""; c().setImage({ src: r.url, alt }).run(); } catch (x: any) { alert(x.message); }
    e.target.value = "";
  }
  return (
    <div className="rounded border border-stone-300 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-stone-200 bg-stone-50 p-1">
        {B("B", "Bold", ed.isActive("bold"), () => c().toggleBold().run())}{B("I", "Italic", ed.isActive("italic"), () => c().toggleItalic().run())}{B("U", "Underline", ed.isActive("underline"), () => c().toggleUnderline().run())}
        {B("H2", "Heading", ed.isActive("heading", { level: 2 }), () => c().toggleHeading({ level: 2 }).run())}{B("H3", "Subheading", ed.isActive("heading", { level: 3 }), () => c().toggleHeading({ level: 3 }).run())}
        {B("•", "Bullet list", ed.isActive("bulletList"), () => c().toggleBulletList().run())}{B("1.", "Numbered list", ed.isActive("orderedList"), () => c().toggleOrderedList().run())}{B("❝", "Quote", ed.isActive("blockquote"), () => c().toggleBlockquote().run())}
        {B("Link", "Add or edit link", ed.isActive("link"), () => { const u = prompt("Link address (leave empty to remove):", ed.getAttributes("link").href || "https://"); if (u === null) return; u ? c().setLink({ href: u }).run() : c().unsetLink().run(); })}
        {B("⇤", "Align left", ed.isActive({ textAlign: "left" }), () => c().setTextAlign("left").run())}{B("↔", "Center", ed.isActive({ textAlign: "center" }), () => c().setTextAlign("center").run())}{B("⇥", "Align right", ed.isActive({ textAlign: "right" }), () => c().setTextAlign("right").run())}
        {B("Table", "Insert table", false, () => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
        <label className="flex min-h-[36px] cursor-pointer items-center rounded bg-white px-2 text-sm hover:bg-stone-100">Image<input type="file" accept="image/*" className="sr-only" onChange={img} /></label>
        {B("↶", "Undo", false, () => c().undo().run())}{B("↷", "Redo", false, () => c().redo().run())}
      </div>
      <EditorContent editor={ed} />
    </div>
  );
}
