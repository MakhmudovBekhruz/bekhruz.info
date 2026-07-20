import { getCollection, type CollectionEntry, type DataCollectionKey } from 'astro:content';
import type { Locale } from '../i18n/ui';

type LocalizedKey = 'projects' | 'experience' | 'testimonials' | 'education';

/**
 * Entries live under per-locale directories (e.g. projects/en/aries.md), so an
 * entry id is `<locale>/<slug>`. Returns the requested locale's entries with an
 * English fallback for any slug missing in that locale.
 */
export async function getByLocale<K extends LocalizedKey>(
  collection: K,
  locale: Locale,
): Promise<CollectionEntry<K>[]> {
  const all = await getCollection(collection);
  const inLocale = new Map(
    all.filter((e) => e.id.startsWith(`${locale}/`)).map((e) => [slugOf(e.id), e]),
  );
  const fallback = all.filter((e) => e.id.startsWith('en/'));
  for (const e of fallback) {
    const slug = slugOf(e.id);
    if (!inLocale.has(slug)) inLocale.set(slug, e);
  }
  return [...inLocale.values()].sort(byOrder);
}

export function slugOf(id: string): string {
  return id.split('/').slice(1).join('/').replace(/\.(md|yaml)$/, '');
}

function byOrder(a: { data: unknown }, b: { data: unknown }): number {
  const ao = (a.data as { order?: number }).order ?? 0;
  const bo = (b.data as { order?: number }).order ?? 0;
  return ao - bo;
}

export async function getProfile(locale: Locale) {
  const all = await getCollection('profile' as DataCollectionKey);
  const entry =
    all.find((e) => e.id === locale) ?? all.find((e) => e.id === 'en');
  if (!entry) throw new Error('profile content missing');
  return entry.data as CollectionEntry<'profile'>['data'];
}
