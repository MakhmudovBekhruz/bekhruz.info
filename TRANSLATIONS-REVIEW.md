# Translations review

Content migrated from the old Firestore portfolio by `scripts/migrate-firestore.mjs` on 2026-07-20.
The script emits the original-language values; every file listed below was then hand-edited with a
machine (Claude) translation and marked `translated: claude`. Files marked `human` carry the old
site's genuine human Russian/Uzbek text verbatim; `original` means untouched source language.

**Note:** re-running `node scripts/migrate-firestore.mjs` regenerates all content files from the raw
dumps and will overwrite the translations below — only re-run it if you intend to redo this pass.

## Cross-cutting fixes (please review)

| Fix | Where | Note |
| --- | --- | --- |
| Years of experience normalized to 7+ | `src/content/profile/{en,ru,uz}.yaml` | Old site said "over 7 years" (EN) but «более чем 6-летним» (RU); UZ was untranslated. All three now say 7+ («более чем 7-летним» / "7+ yillik"). Career start Aug 2019 supports 7. |
| IZI Study EN description was actually Uzbek | `src/content/projects/en/izi-study.md`, `ru/`, `uz/` | The old DB had the same Uzbek text in all three locales. It is kept as the UZ original; EN and RU are new Claude translations. |
| Hisobot description existed only in Russian | `src/content/projects/{en,uz}/hisobot.md` | Old DB had the Russian text in all three locales. RU keeps it verbatim (`translated: original`); EN and UZ are new Claude translations. |
| Broken App Store link fixed | `src/content/projects/*/izi-study.md` | `https://apps.apple.comapp/app/id1625591100` → `https://apps.apple.com/app/id1625591100` (fixed in the migration script). |
| Title typo fixed | `src/content/projects/{ru,uz}/hisobot.md` | RU/UZ title was "Hisbot.com" in Firestore; normalized to "Hisobot.com" (matches EN). |
| Stray leading spaces trimmed | testimonial " Abdullo Magrupov", experience title " Senior Flutter Developer" | Trimmed by the migration script for all strings. |
| Broken Telegram link fixed | `src/content/profile/*.yaml` | Old site linked `bekhruz.info/t.me/+998997025670`; now `https://t.me/+998997025670`. |
| cvUrl repointed | `src/content/profile/*.yaml` | Firebase Storage URL → local `/cv/bekhruz-makhmudov-cv.pdf` (file already in `public/cv/`). |
| RU spelling fix | `src/content/projects/ru/multicard.md` | «Кобейжинговая» → «Кобейджинговая» in otherwise-verbatim original Russian text. |
| Sarvar Salyamov role headline shortened in RU/UZ | `src/content/testimonials/{ru,uz}/sarvar-salyamov.yaml` | EN keeps the full LinkedIn-style headline incl. "📌HR in Tech📌🔝 IT HR Community"; RU/UZ use the cleaner "Talent Acquisition \| People Operations Manager \| HR BP". |

## Machine-translated files (`translated: claude`)

### Projects (description body + tagline; taglines are newly written for all locales)

| File | What was translated | Note |
| --- | --- | --- |
| `projects/en/hisobot.md` | Full description RU → EN | Source was Russian-only. |
| `projects/en/izi-study.md` | Full description UZ → EN | Source was Uzbek mislabeled as EN. |
| `projects/en/multicard.md` | Full description RU → EN | Source was Russian in all locales. |
| `projects/ru/aries.md` | Full description EN → RU | |
| `projects/ru/izi-study.md` | Full description UZ → RU | |
| `projects/ru/maak.md` | Full description EN → RU | |
| `projects/ru/neva.md` | Full description EN → RU | |
| `projects/ru/quran-app.md` | Full description EN → RU | |
| `projects/ru/shipox-driver.md` | Full description EN → RU | |
| `projects/ru/simidan-mover.md` | Full description EN → RU | |
| `projects/ru/spreadlee.md` | Full description EN → RU | |
| `projects/ru/staffly.md` | Full description EN → RU | |
| `projects/ru/when-we-first.md` | Full description EN → RU | |
| `projects/ru/xeela.md` | Full description EN → RU | |
| `projects/uz/*.md` (12 files, all except `izi-study`) | Full description EN (or RU for hisobot/multicard) → UZ | Uzbek Latin script. `uz/izi-study.md` keeps the genuine Uzbek original. |

Not translated (kept original English): `projects/en/{aries,maak,neva,quran-app,shipox-driver,simidan-mover,spreadlee,staffly,when-we-first,xeela}.md`; kept original Russian: `projects/ru/{hisobot,multicard}.md`.

### Experience

| File | What was translated | Note |
| --- | --- | --- |
| `experience/uz/*.yaml` (5 files) | Responsibilities, employmentType, location, titles EN → UZ | Old DB's UZ merely duplicated the English. |
| `experience/ru/*.yaml` (5 files) | Only minor fields (employmentType, location, and title where it duplicated EN) | Responsibilities keep the old site's human Russian verbatim (split into bullets), hence `translated: human`. |

All experience blobs (one long sentence per role) were split into 3–6 bullet sentences in every locale; wording preserved.

### Testimonials

| File | What was translated | Note |
| --- | --- | --- |
| `testimonials/ru/*.yaml` (4 files) | Quote + role EN → RU | Names kept in Latin. |
| `testimonials/uz/*.yaml` (4 files) | Quote + role EN → UZ | Names kept in Latin. |

### Profile

| File | What was translated | Note |
| --- | --- | --- |
| `profile/uz.yaml` | About EN → UZ | UZ was never translated on the old site. |

`profile/en.yaml` is original; `profile/ru.yaml` is the old site's human translation (`translated: human`, with only the 6→7 years fix).

### Education

`education/{ru,uz}/tuit.yaml` carry the old site's genuine per-locale values (`translated: human`); nothing machine-translated.

## Other anomalies found in the data

- The old hero section also listed skills (Bloc, Dart, Firebase, Flutter, Git, Java, Kotlin, Spring, SQL, Swift), but the `profile` schema in `src/content.config.ts` has no `skills` field — they were not migrated. See `scripts/raw/salvage_hero.json` if you want them.
- Company names kept verbatim from Firestore: `Multicard(multibank.uz)` and `zip24.com(shipox.com)` (no space before the parenthesis).
- Both Jafton experience entries reference the same logo image; it is stored once as `src/assets/companies/jafton.webp`.
- `projects/*/aries.md` `live` link is plain `http://` (as in the source data).
