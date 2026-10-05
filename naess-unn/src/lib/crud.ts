export type Field = { name: string; label: string; type: "text" | "textarea" | "rich" | "image" | "file" | "date" | "time" | "datetime" | "bool" | "select" | "number" | "tags" | "relation" | "json" | "slug"; options?: string[]; rel?: { table: string; label: string }; required?: boolean; slugFrom?: string; hint?: string; readonly?: boolean };
export type Resource = { table: string; title: string; singular: string; fields: Field[]; cols: string[]; order: [string, boolean]; search: string; sortable?: boolean; toggle?: string; noCreate?: boolean; noDelete?: boolean; touch?: boolean; exclusive?: string; preview?: string; extra?: { label: string; href: string } };
export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const T = (name: string, label: string, o: Partial<Field> = {}): Field => ({ name, label, type: "text", ...o });
const status = T("status", "Status", { type: "select", options: ["draft", "published", "archived"], hint: "Only Published items appear on the website." });
const seo = [T("seo_title", "SEO title"), T("seo_description", "SEO description", { type: "textarea" }), T("og_image", "Social share image", { type: "image" })];
const sortF = T("sort_order", "Order", { type: "number", hint: "Lower numbers appear first." });
export const RESOURCES: Record<string, Resource> = {
  news: { table: "news", title: "News", singular: "article", touch: true, preview: "/news/", search: "title", order: ["created_at", false], cols: ["title", "status", "published_at", "featured"], fields: [
    T("title", "Title", { required: true }), T("slug", "Slug (web address)", { type: "slug", slugFrom: "title" }), T("excerpt", "Short summary", { type: "textarea" }),
    T("cover_image", "Cover image", { type: "image" }), T("content", "Content", { type: "rich" }), T("category_id", "Category", { type: "relation", rel: { table: "news_categories", label: "name" } }),
    T("author", "Author"), T("tags", "Tags (comma separated)", { type: "tags" }), status, T("published_at", "Publish date", { type: "datetime", hint: "Set a future date to schedule. Leave empty to publish now." }),
    T("featured", "Featured", { type: "bool" }), ...seo, T("canonical_url", "Canonical URL")] },
  events: { table: "events", title: "Events", singular: "event", touch: true, preview: "/events/", search: "title", order: ["event_date", false], cols: ["title", "event_date", "event_status", "status"], fields: [
    T("title", "Title", { required: true }), T("slug", "Slug (web address)", { type: "slug", slugFrom: "title" }), T("description", "Description", { type: "rich" }), T("image_url", "Event image", { type: "image" }),
    T("event_date", "Date", { type: "date", required: true }), T("start_time", "Start time", { type: "time" }), T("end_time", "End time", { type: "time" }), T("venue", "Venue"), T("organizer", "Organizer"),
    T("registration_url", "Registration URL"), T("event_status", "Event status", { type: "select", options: ["upcoming", "ongoing", "completed", "cancelled"] }), T("report", "Event report", { type: "rich" }),
    status, T("featured", "Featured", { type: "bool" }), ...seo, T("canonical_url", "Canonical URL")] },
  albums: { table: "gallery_albums", title: "Gallery albums", singular: "album", preview: "/gallery/", search: "title", order: ["album_date", false], cols: ["title", "album_date", "status", "featured"], extra: { label: "Manage images", href: "/admin/album-images/" }, fields: [
    T("title", "Album title", { required: true }), T("slug", "Slug (web address)", { type: "slug", slugFrom: "title" }), T("description", "Description", { type: "textarea" }), T("cover_image", "Cover image", { type: "image" }),
    T("album_date", "Date", { type: "date" }), T("location", "Location"), status, T("featured", "Featured", { type: "bool" }), ...seo] },
  documents: { table: "documents", title: "Documents", singular: "document", preview: "/documents/", search: "title", order: ["created_at", false], cols: ["title", "category_id", "status", "featured"], fields: [
    T("title", "Title", { required: true }), T("slug", "Slug (web address)", { type: "slug", slugFrom: "title" }), T("description", "Description", { type: "textarea" }),
    T("category_id", "Category", { type: "relation", rel: { table: "document_categories", label: "name" } }), T("file_url", "File (PDF, Word, Excel)", { type: "file", required: true }), status, T("featured", "Featured", { type: "bool" }),
    T("seo_title", "SEO title"), T("seo_description", "SEO description", { type: "textarea" })] },
  administrations: { table: "administrations", title: "Administrations / sessions", singular: "administration", search: "session", order: ["session", false], exclusive: "is_current", cols: ["session", "title", "is_current", "status"], fields: [
    T("session", "Session", { required: true, hint: "Example: 2026/2027" }), T("title", "Title", { hint: "Example: 2026/2027 Executive Council" }), T("description", "Description", { type: "textarea" }),
    T("is_current", "Current administration", { type: "bool", hint: "Only one can be current. Past ones stay in the archive." }), status] },
  executives: { table: "executives", title: "Executives", singular: "executive", search: "full_name", order: ["sort_order", true], cols: ["full_name", "position_id", "administration_id", "status"], fields: [
    T("administration_id", "Administration", { type: "relation", rel: { table: "administrations", label: "session" }, required: true }), T("position_id", "Position", { type: "relation", rel: { table: "positions", label: "name" } }),
    T("full_name", "Full name", { required: true }), T("photo_url", "Profile photo", { type: "image" }), T("faculty", "Faculty"), T("department", "Department"), T("level", "Level"), T("bio", "Biography", { type: "rich" }),
    T("social_links", "Social links (JSON)", { type: "json", hint: 'Example: [{"platform":"Instagram","url":"https://..."}]' }), sortF, status] },
  positions: { table: "positions", title: "Positions", singular: "position", search: "name", order: ["sort_order", true], sortable: true, cols: ["name"], fields: [T("name", "Position name", { required: true }), sortF] },
  history: { table: "history_entries", title: "History timeline", singular: "history entry", search: "title", order: ["sort_order", true], sortable: true, cols: ["year", "title", "status"], fields: [
    T("year", "Year", { required: true }), T("title", "Title", { required: true }), T("description", "Description", { type: "rich" }), T("image_url", "Image", { type: "image" }), T("gallery", "Extra gallery images (JSON list of URLs)", { type: "json" }), sortF, status] },
  pages: { table: "pages", title: "About, Mission & Vision", singular: "page section", touch: true, search: "title", order: ["sort_order", true], sortable: true, cols: ["title", "slug", "status"], fields: [
    T("title", "Title", { required: true }), T("slug", "Slug", { required: true, hint: "about, mission, vision, objectives, values are used on the About page." }), T("content", "Content", { type: "rich" }), T("image_url", "Image", { type: "image" }), sortF, status, ...seo] },
  navigation: { table: "navigation_items", title: "Navigation menu", singular: "menu item", search: "label", order: ["sort_order", true], sortable: true, toggle: "visible", cols: ["label", "url", "location", "visible"], fields: [
    T("label", "Label", { required: true }), T("url", "URL", { required: true, hint: "Example: /news or https://example.com" }), T("parent_id", "Parent (for dropdowns)", { type: "relation", rel: { table: "navigation_items", label: "label" } }),
    T("location", "Location", { type: "select", options: ["header", "footer"] }), T("visible", "Visible", { type: "bool" }), sortF] },
  homepage: { table: "homepage_sections", title: "Homepage sections", singular: "section", search: "title", order: ["sort_order", true], sortable: true, toggle: "visible", noCreate: true, noDelete: true, cols: ["key", "title", "visible"], fields: [
    T("key", "Section", { readonly: true }), T("title", "Heading"), T("subtitle", "Eyebrow / subheading"), T("body", "Description", { type: "textarea" }), T("image_url", "Image", { type: "image" }),
    T("button_label", "Button text"), T("button_url", "Button URL"), T("secondary_button_label", "Second button text"), T("secondary_button_url", "Second button URL"),
    T("alignment", "Alignment", { type: "select", options: ["left", "center"] }), T("config", "Advanced settings (JSON)", { type: "json", hint: 'Hero: {"overlay":true,"show_event":true}. Lists: {"count":3}. Stats: {"items":[{"label":"Members","value":"1000"}]}' }), T("visible", "Visible on homepage", { type: "bool" }), sortF] },
  "news-categories": { table: "news_categories", title: "News categories", singular: "category", search: "name", order: ["sort_order", true], cols: ["name", "slug"], fields: [T("name", "Name", { required: true }), T("slug", "Slug", { type: "slug", slugFrom: "name" }), sortF] },
  "document-categories": { table: "document_categories", title: "Document categories", singular: "category", search: "name", order: ["sort_order", true], cols: ["name", "slug"], fields: [T("name", "Name", { required: true }), T("slug", "Slug", { type: "slug", slugFrom: "name" }), sortF] },
  social: { table: "social_links", title: "Social media links", singular: "link", search: "platform", order: ["sort_order", true], sortable: true, toggle: "visible", cols: ["platform", "url", "visible"], fields: [
    T("platform", "Platform", { type: "select", options: ["Facebook", "Instagram", "X", "WhatsApp", "YouTube", "TikTok", "LinkedIn", "Other"] }), T("label", "Label"), T("url", "URL", { required: true }), T("visible", "Visible", { type: "bool" }), sortF] },
};
