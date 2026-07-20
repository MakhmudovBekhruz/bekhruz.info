#!/usr/bin/env node
/**
 * migrate-firestore.mjs
 *
 * One-shot migration of the old Firestore-backed portfolio (persfolio-tob49)
 * into Astro content collections. Parses the raw Firestore REST dumps in
 * scripts/raw/, downloads referenced images into src/assets/, and emits
 * per-locale content files under src/content/.
 *
 * Emits the ORIGINAL language values found in the dumps (plus a few mechanical
 * data fixes below). Human/Claude translation fixes are applied afterwards by
 * editing the generated files — re-running this script overwrites those edits.
 *
 * Mechanical fixes applied here:
 *  - broken IZI Study App Store URL (apps.apple.comapp/... -> apps.apple.com/app/...)
 *  - "Hisbot.com" title typo -> "Hisobot.com"
 *  - stray leading/trailing whitespace on all strings (e.g. " Abdullo Magrupov")
 *  - profile RU "6-летним" -> "7-летним" (normalize years of experience to 7+)
 *
 * Usage: node scripts/migrate-firestore.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['en', 'ru', 'uz'];

// ---------------------------------------------------------------- utilities

function readRaw(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/raw', name), 'utf8'));
}

/** Decode a Firestore REST value wrapper into a plain JS value. */
function decode(v) {
  if (v == null) return null;
  if ('stringValue' in v) return fixString(v.stringValue);
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('mapValue' in v) {
    const o = {};
    for (const [k, val] of Object.entries(v.mapValue.fields ?? {})) o[k] = decode(val);
    return o;
  }
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(decode);
  throw new Error('Unknown Firestore value: ' + JSON.stringify(v));
}

function docFields(doc) {
  const o = {};
  for (const [k, v] of Object.entries(doc.fields ?? {})) o[k] = decode(v);
  return o;
}

/** Mechanical data fixes on every decoded string. */
function fixString(s) {
  return s
    .trim()
    .replace('apps.apple.comapp/', 'apps.apple.com/app/')
    .replace('Hisbot.com', 'Hisobot.com');
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['’‘]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** YAML scalar via JSON string escaping (valid YAML double-quoted style). */
const y = (v) => (v === null ? 'null' : typeof v === 'string' ? JSON.stringify(v) : String(v));

const dateOnly = (ts) => (ts ? ts.slice(0, 10) : null);

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(rel, content) {
  const abs = path.join(ROOT, rel);
  mkdirp(path.dirname(abs));
  fs.writeFileSync(abs, content);
  written.push(rel);
}

const written = [];
const downloaded = [];

const EXT_BY_TYPE = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

/** Download url to <destDirRel>/<base>.<ext-from-content-type>; returns filename. */
async function download(url, destDirRel, base) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const type = (res.headers.get('content-type') || '').split(';')[0].trim();
  const ext = EXT_BY_TYPE[type];
  if (!ext) throw new Error(`Unrecognized content-type "${type}" for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const file = base + ext;
  const abs = path.join(ROOT, destDirRel, file);
  mkdirp(path.dirname(abs));
  fs.writeFileSync(abs, buf);
  downloaded.push(`${destDirRel}/${file} (${type}, ${buf.length} bytes)`);
  return file;
}

// ---------------------------------------------------------------- projects

// Preserve current site order (order field 1..13).
const PROJECT_ORDER = [
  'aries', 'hisobot', 'izi-study', 'maak', 'multicard', 'neva', 'quran-app',
  'shipox-driver', 'simidan-mover', 'spreadlee', 'staffly', 'when-we-first', 'xeela',
];

const PROJECT_SLUG_OVERRIDES = {
  'ARIES – Chat & Meet on a Map': 'aries',
  'Maak - معـك': 'maak',
  'Xeela: The Transformation App': 'xeela',
  'Hisobot.com': 'hisobot',
  'Shipox Driver App': 'shipox-driver',
  "Qur'an App": 'quran-app',
  'Qur’an App': 'quran-app',
};

// New one-line taglines (authored for this migration; old data had none).
const TAGLINES = {
  aries: {
    en: 'Anonymous chat app where live conversations happen right on a world map.',
    ru: 'Анонимный чат на карте мира: живые обсуждения мест и тем в реальном времени.',
    uz: "Dunyo xaritasida jonli suhbatlar olib boriladigan anonim chat ilovasi.",
  },
  hisobot: {
    en: 'Business management app with tasks, calendar, HR tools and Telegram integration.',
    ru: 'Приложение для управления бизнесом: задачи, календарь, сотрудники и Telegram-бот.',
    uz: "Biznesni boshqarish ilovasi: vazifalar, kalendar, xodimlar va Telegram-bot.",
  },
  'izi-study': {
    en: 'Language-learning app for Russian, English, German, French and Arabic.',
    ru: 'Приложение для изучения русского, английского, немецкого, французского и арабского.',
    uz: "Rus, ingliz, nemis, fransuz va arab tillarini o'rgatuvchi zamonaviy ilova.",
  },
  maak: {
    en: 'Telemedicine app for family medicine and mental health consultations.',
    ru: 'Телемедицинское приложение для консультаций врачей и психологов.',
    uz: "Shifokorlar va psixologlar bilan onlayn konsultatsiyalar uchun telemeditsina ilovasi.",
  },
  multicard: {
    en: 'Banking app with card management, payments and money transfers.',
    ru: 'Банковское приложение: карты Multicard Black и Humo, оплаты и переводы.',
    uz: "Kartalarni boshqarish, to'lovlar va pul o'tkazmalari uchun bank ilovasi.",
  },
  neva: {
    en: 'Family marketplace app with a wide range of products from A to Z.',
    ru: 'Маркетплейс для всей семьи с широким ассортиментом товаров от А до Я.',
    uz: "Butun oila uchun A dan Z gacha mahsulotlar jamlangan marketpleys ilovasi.",
  },
  'quran-app': {
    en: "Read and listen to the Qur'an word by word, with Tajweed rules and translation.",
    ru: 'Чтение и прослушивание Корана: пословный режим, таджвид и перевод.',
    uz: "Qur'onni so'zma-so'z, tajvid qoidalari va tarjima bilan o'qish va tinglash.",
  },
  'shipox-driver': {
    en: 'Delivery driver app with navigation, live status updates and delivery confirmation.',
    ru: 'Приложение для курьеров: навигация, статусы доставки и подтверждение вручения.',
    uz: "Haydovchilar uchun navigatsiya va yetkazib berishni tasdiqlash ilovasi.",
  },
  'simidan-mover': {
    en: 'App for movers to bid on jobs and manage orders, schedules and payments.',
    ru: 'Приложение для грузчиков: заявки на заказы, график работы и выплаты.',
    uz: "Yuk tashuvchilar uchun buyurtmalar, ish jadvali va to'lovlarni boshqarish ilovasi.",
  },
  spreadlee: {
    en: 'Advertising marketplace connecting users with influencers and ad companies.',
    ru: 'Рекламная платформа, связывающая пользователей с инфлюенсерами по всему миру.',
    uz: "Foydalanuvchilarni influenserlar bilan bog'lovchi global reklama platformasi.",
  },
  staffly: {
    en: 'Cloud HR management app — register your company and run HR tasks in minutes.',
    ru: 'Облачное HR-приложение: зарегистрируйте компанию и управляйте кадрами за минуты.',
    uz: "Bulutli HR ilovasi — kompaniyani ro'yxatdan o'tkazib, kadrlar ishini yuriting.",
  },
  'when-we-first': {
    en: 'Dating app where real matchmakers help you find meaningful connections.',
    ru: 'Приложение для знакомств, где живые сваты помогают найти серьёзные отношения.',
    uz: "Haqiqiy sovchilar yordamida jiddiy munosabatlar topish uchun tanishuv ilovasi.",
  },
  xeela: {
    en: 'Fitness app with personalized workout and nutrition plans for your dream physique.',
    ru: 'Фитнес-приложение с персональными планами тренировок и питания.',
    uz: "Shaxsiy mashg'ulot va ovqatlanish rejalari bilan fitnes ilovasi.",
  },
};

/** Light markdown cleanup: trim lines, collapse 3+ newlines. */
function cleanBody(text) {
  return (
    text
      .split('\n')
      .map((l) => l.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}

async function migrateProjects() {
  const docs = readRaw('fs_projects.json').documents.map(docFields);
  for (const f of docs) {
    const titleEn = f.title.en;
    const slug = PROJECT_SLUG_OVERRIDES[titleEn] ?? slugify(titleEn);
    const order = PROJECT_ORDER.indexOf(slug) + 1;
    if (order === 0) throw new Error(`Project slug not in PROJECT_ORDER: ${slug}`);

    let imageFile = null;
    if (f.image) imageFile = await download(f.image, 'src/assets/projects', slug);

    for (const loc of LOCALES) {
      const lines = [];
      lines.push('---');
      lines.push(`title: ${y(f.title[loc] ?? titleEn)}`);
      lines.push(`tagline: ${y(TAGLINES[slug][loc])}`);
      lines.push(`order: ${order}`);
      lines.push('stack:');
      for (const s of f.stack ?? []) lines.push(`  - ${y(s)}`);
      const links = Object.entries(f.links ?? {}).filter(([, v]) => v);
      if (links.length) {
        lines.push('links:');
        for (const [k, v] of links.sort(([a], [b]) => a.localeCompare(b))) {
          lines.push(`  ${k}: ${y(v)}`);
        }
      }
      if (imageFile) lines.push(`image: ${y(`../../../assets/projects/${imageFile}`)}`);
      lines.push('translated: original');
      lines.push('---');
      const body = cleanBody(f.description?.[loc] ?? f.description?.en ?? '');
      writeFile(`src/content/projects/${loc}/${slug}.md`, lines.join('\n') + '\n\n' + body);
    }
  }
}

// ---------------------------------------------------------------- experience

// Most recent first, as on the site.
const EXP_ORDER = {
  'jafton-team-lead': 1,
  'jafton-senior': 2,
  'east-telecom': 3,
  multicard: 4,
  shipox: 5,
};
const COMPANY_SLUG = {
  'jafton-team-lead': 'jafton',
  'jafton-senior': 'jafton',
  'east-telecom': 'east-telecom',
  multicard: 'multicard',
  shipox: 'shipox',
};

function expSlug(f) {
  const c = f.company.en;
  if (c.includes('Jafton')) return f.isCurrent ? 'jafton-team-lead' : 'jafton-senior';
  if (c.includes('East')) return 'east-telecom';
  if (c.includes('Multicard')) return 'multicard';
  if (c.includes('shipox')) return 'shipox';
  throw new Error(`Unknown company: ${c}`);
}

/**
 * Split the single responsibilities text blob into bullet sentences.
 * Heuristic: drop the narrative intro before the first em-dash ("At X, I ..."),
 * then split on semicolons. Files with too few natural splits are refined by
 * hand after generation.
 */
function splitResponsibilities(text) {
  let t = text.replace(/\s+/g, ' ').trim();
  const m = t.match(/^(.*?)—\s*(.*)$/s);
  if (m && /\b(I|я)\b/i.test(m[1]) && m[2].length > 40) t = m[2];
  return t
    .split(/;\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => {
      p = p.replace(/^(and|а также|и|hamda|va)\s+/i, '');
      p = p.charAt(0).toUpperCase() + p.slice(1);
      if (!/[.!?]$/.test(p)) p += '.';
      return p;
    });
}

async function migrateExperience() {
  const docs = readRaw('fs_experience.json').documents.map(docFields);
  // Deterministic processing order.
  docs.sort((a, b) => EXP_ORDER[expSlug(a)] - EXP_ORDER[expSlug(b)]);
  for (const f of docs) {
    const slug = expSlug(f);
    const companySlug = COMPANY_SLUG[slug];
    let logoFile = null;
    if (f.companyLogoUrl) logoFile = await download(f.companyLogoUrl, 'src/assets/companies', companySlug);

    for (const loc of LOCALES) {
      const blob = (f.responsibilities ?? []).map((r) => r[loc] ?? r.en).join(' ');
      const bullets = splitResponsibilities(blob);
      const lines = [];
      lines.push(`company: ${y(f.company[loc])}`);
      lines.push(`companyUrl: ${y(f.companyUrl ?? null)}`);
      lines.push(`logo: ${y(logoFile ? `../../../assets/companies/${logoFile}` : null)}`);
      lines.push(`title: ${y(f.title[loc])}`);
      lines.push(`employmentType: ${y(f.employmentType[loc])}`);
      lines.push(`location: ${y(f.location[loc])}`);
      lines.push(`from: ${dateOnly(f.from)}`);
      lines.push(`to: ${f.isCurrent || !f.to ? 'null' : dateOnly(f.to)}`);
      lines.push(`isCurrent: ${f.isCurrent === true}`);
      lines.push('responsibilities:');
      for (const b of bullets) lines.push(`  - ${y(b)}`);
      lines.push(`order: ${EXP_ORDER[slug]}`);
      lines.push('translated: original');
      writeFile(`src/content/experience/${loc}/${slug}.yaml`, lines.join('\n') + '\n');
    }
  }
}

// ---------------------------------------------------------------- testimonials

const TESTIMONIAL_ORDER = {
  'akrom-nasyrov': 1,
  'sarvar-salyamov': 2,
  'abdullo-magrupov': 3,
  'islombek-toshev': 4,
};

async function migrateTestimonials() {
  const docs = readRaw('fs_testimonials.json').documents.map(docFields);
  docs.sort((a, b) => TESTIMONIAL_ORDER[slugify(a.name.en)] - TESTIMONIAL_ORDER[slugify(b.name.en)]);
  for (const f of docs) {
    const slug = slugify(f.name.en);
    const order = TESTIMONIAL_ORDER[slug];
    if (!order) throw new Error(`Testimonial not in TESTIMONIAL_ORDER: ${slug}`);
    let imageFile = null;
    if (f.image) imageFile = await download(f.image, 'src/assets/testimonials', slug);

    for (const loc of LOCALES) {
      const lines = [];
      lines.push(`name: ${y(f.name[loc])}`);
      lines.push(`role: ${y(f.role[loc])}`);
      lines.push(`company: ${y(f.company[loc])}`);
      lines.push(`quote: ${y(f.quote[loc])}`);
      lines.push(`image: ${y(imageFile ? `../../../assets/testimonials/${imageFile}` : null)}`);
      lines.push(`order: ${order}`);
      lines.push('translated: original');
      writeFile(`src/content/testimonials/${loc}/${slug}.yaml`, lines.join('\n') + '\n');
    }
  }
}

// ---------------------------------------------------------------- education

async function migrateEducation() {
  const docs = readRaw('fs_education.json').documents.map(docFields);
  for (const f of docs) {
    for (const loc of LOCALES) {
      const lines = [];
      lines.push(`institution: ${y(f.institution[loc])}`);
      lines.push(`degree: ${y(f.degree[loc])}`);
      lines.push(`from: ${dateOnly(f.from)}`);
      lines.push(`to: ${dateOnly(f.to)}`);
      lines.push('translated: original');
      writeFile(`src/content/education/${loc}/tuit.yaml`, lines.join('\n') + '\n');
    }
  }
}

// ---------------------------------------------------------------- profile

function migrateProfile() {
  const hero = readRaw('salvage_hero.json');
  const about = {
    en: hero.about.en, // already says "over 7 years"
    // Normalize years of experience to 7+ (was «6-летним» on the old site).
    ru: hero.about.ru.replace('6-летним', '7-летним'),
    // uz was never translated on the old site; en emitted as fallback,
    // replaced with a real Uzbek translation after generation.
    uz: hero.about.uz.startsWith('UNTRANSLATED') ? hero.about.en : hero.about.uz,
  };
  for (const loc of LOCALES) {
    const lines = [];
    lines.push(`name: ${y(hero.name)}`);
    lines.push(`role: ${y(hero.role[loc])}`);
    lines.push(`location: ${y(hero.location[loc])}`);
    lines.push(`about: ${y(about[loc])}`);
    lines.push(`email: ${y(hero.email)}`);
    lines.push(`phone: ${y(hero.phone)}`);
    lines.push(`cvUrl: ${y('/cv/bekhruz-makhmudov-cv.pdf')}`);
    lines.push('socials:');
    lines.push(`  github: ${y(hero.socials.github)}`);
    lines.push(`  linkedin: ${y(hero.socials.linkedin)}`);
    lines.push(`  telegram: ${y('https://t.me/+998997025670')}`);
    lines.push('translated: original');
    writeFile(`src/content/profile/${loc}.yaml`, lines.join('\n') + '\n');
  }
}

// ---------------------------------------------------------------- main

await migrateProjects();
await migrateExperience();
await migrateTestimonials();
await migrateEducation();
migrateProfile();

console.log(`\nDownloaded ${downloaded.length} images:`);
for (const d of downloaded) console.log('  ' + d);

const counts = {};
for (const w of written) {
  const key = w.split('/').slice(0, 4).join('/');
  counts[key] = (counts[key] ?? 0) + 1;
}
console.log(`\nWrote ${written.length} content files:`);
for (const [k, n] of Object.entries(counts).sort()) console.log(`  ${k}: ${n}`);
