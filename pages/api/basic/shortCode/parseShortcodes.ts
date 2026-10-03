import ShortCode from "lib/models/basic/ShortCode";
import ShortCodeDetail from "lib/models/basic/ShortCodeDetail";

const SHORTCODE_REGEX = /\[shortcode\s*:\s*(\d+)\s*(?:\|\s*(.*?)\s*)?\]/gi;

export async function parseShortcodes(content: string) {
  let html = content;
  const matches = [...content.matchAll(SHORTCODE_REGEX)];

  for (const match of matches) {
    const [fullMatch, callId, heading] = match;

    const shortcode = await ShortCode.findOne({ call_id: Number(callId), status: true });
    if (!shortcode) continue;

    const details = await ShortCodeDetail.find({ shortCode_id: shortcode._id }).sort({ displayOrder: 1 })
      .populate({ path: "module_id", populate: { path: "media_id", model: "Media" }, }); 

    const modules = details.map((d: { module_id: any; }) => d.module_id).filter(Boolean);
    const gridHTML = renderGrid(modules, heading);
    html = html.replace(fullMatch, gridHTML);
  }

  return html;
}

export function renderGrid( items: any[], heading?: string ) {
  let html = `<section class="py-6">`;

  if (heading) {
    html += `<h3 class="text-xl font-semibold mb-4">${heading}</h3>`; }

  html += `<div class="grid grid-cols-2 md:grid-cols-3 gap-4">`;

  for (const item of items) {
    const img = item?.media_id?.path ?? "/images/static/default.jpg";
    const alt = item?.media_id?.alt ?? item?.name ?? "Image";

    html += `
      <a href="/treatment/${item.url}" class="group rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-white">
        <div class="relative h-40">
          <img src="${img}" alt="${alt}" class="w-full h-full object-cover" loading="lazy" />
        </div>

        <div class="p-3">
          <p class="text-sm font-semibold text-center group-hover:text-primary">${item.name}</p>
        </div>
      </a>
    `;
  }

  html += `</div></section>`;
  return html;
}