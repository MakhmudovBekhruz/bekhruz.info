import type { ImageMetadata } from 'astro';

/**
 * Content collections store experience logos / testimonial photos as plain
 * string paths. Files under src/assets can only be served through
 * astro:assets, so we eagerly glob every asset and resolve string paths
 * against that map (matching on the path after "assets/").
 */
const assets = import.meta.glob<ImageMetadata>('../assets/**/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  import: 'default',
});

const byTail = new Map<string, ImageMetadata>();
for (const [key, img] of Object.entries(assets)) {
  const tail = key.split('/assets/').pop();
  if (tail) byTail.set(tail, img);
}

/**
 * Resolve a content-provided path like "companies/foo.png",
 * "src/assets/companies/foo.png" or "../../assets/companies/foo.png" to the
 * imported ImageMetadata. Returns null when nothing matches (callers render a
 * monogram fallback).
 */
export function resolveAsset(path: string | null | undefined): ImageMetadata | null {
  if (!path) return null;
  const norm = path.replace(/\\/g, '/');
  const tail = norm.includes('assets/')
    ? (norm.split('assets/').pop() ?? '')
    : norm.replace(/^\.?\/+/, '');
  if (!tail) return null;
  const direct = byTail.get(tail);
  if (direct) return direct;
  for (const [key, img] of byTail) {
    if (key.endsWith(`/${tail}`) || key.endsWith(tail)) return img;
  }
  return null;
}
