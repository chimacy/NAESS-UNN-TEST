import sanitizeHtml from "sanitize-html";
export const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" }) : "");
export const stripHtml = (h?: string | null) => (h ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
export const readingTime = (h?: string | null) => Math.max(1, Math.round(stripHtml(h).split(" ").length / 200));
export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
export const clean = (h?: string | null) => sanitizeHtml(h ?? "", {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "u", "table", "thead", "tbody", "tr", "th", "td", "figure", "figcaption"]),
  allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "width", "height"], td: ["colspan", "rowspan"], th: ["colspan", "rowspan"], "*": ["style"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
  transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
});
