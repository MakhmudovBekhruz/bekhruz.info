import type { Locale } from '../i18n/ui';

const SITE = 'https://bekhruz.info';

export function personJsonLd(locale: Locale, profile: {
  name: string;
  role: string;
  about: string;
  email: string;
  socials: { github: string; linkedin: string; telegram: string };
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    alternateName: ['Behruz Mahmudov', 'Бехруз Махмудов'],
    jobTitle: profile.role,
    description: profile.about,
    email: `mailto:${profile.email}`,
    url: SITE,
    image: `${SITE}/og.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tashkent',
      addressCountry: 'UZ',
    },
    sameAs: [profile.socials.github, profile.socials.linkedin, profile.socials.telegram],
    knowsAbout: ['Flutter', 'Dart', 'Firebase', 'Java', 'Spring Boot', 'PostgreSQL', 'Swift', 'Kotlin', 'Mobile Development'],
  };
}

export function websiteJsonLd(locale: Locale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bekhruz Makhmudov — Portfolio',
    url: SITE,
    inLanguage: ['en', 'ru', 'uz'],
  };
}

export function projectJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  appStore?: string | null;
  playStore?: string | null;
}): Record<string, unknown> {
  const sameAs = [opts.appStore, opts.playStore].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: opts.title,
    description: opts.description,
    url: opts.url,
    ...(opts.image ? { image: opts.image } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    applicationCategory: 'MobileApplication',
    operatingSystem: 'iOS, Android',
    author: {
      '@type': 'Person',
      name: 'Bekhruz Makhmudov',
      url: SITE,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
