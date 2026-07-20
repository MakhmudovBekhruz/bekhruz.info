import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      order: z.number(),
      stack: z.array(z.string()),
      links: z
        .object({
          appStore: z.string().url().nullable().optional(),
          playStore: z.string().url().nullable().optional(),
          live: z.string().url().nullable().optional(),
          github: z.string().url().nullable().optional(),
        })
        .default({}),
      image: image().nullable().optional(),
      translated: z.enum(['claude', 'human', 'original']).default('original'),
    }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    companyUrl: z.string().url().nullable().optional(),
    logo: z.string().nullable().optional(),
    title: z.string(),
    employmentType: z.string(),
    location: z.string(),
    from: z.coerce.date(),
    to: z.coerce.date().nullable().optional(),
    isCurrent: z.boolean().default(false),
    responsibilities: z.array(z.string()),
    order: z.number(),
    translated: z.enum(['claude', 'human', 'original']).default('original'),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    quote: z.string(),
    image: z.string().nullable().optional(),
    order: z.number(),
    translated: z.enum(['claude', 'human', 'original']).default('original'),
  }),
});

const education = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/education' }),
  schema: z.object({
    institution: z.string(),
    degree: z.string(),
    from: z.coerce.date(),
    to: z.coerce.date(),
    translated: z.enum(['claude', 'human', 'original']).default('original'),
  }),
});

const profile = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/profile' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    location: z.string(),
    about: z.string(),
    email: z.string().email(),
    phone: z.string(),
    cvUrl: z.string(),
    socials: z.object({
      github: z.string().url(),
      linkedin: z.string().url(),
      telegram: z.string().url(),
    }),
    translated: z.enum(['claude', 'human', 'original']).default('original'),
  }),
});

export const collections = { projects, experience, testimonials, education, profile };
