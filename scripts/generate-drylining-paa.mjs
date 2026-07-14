import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'src/data/paas.json');
const statePath = path.join(root, 'src/data/paa-state.json');
const sitemapPath = path.join(root, 'public/sitemap.xml');
const pagesDir = path.join(root, 'src/pages/paa');
const siteUrl = 'https://dryliningedinburgh.co.uk';

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function pageSource({ question, answer, slug }) {
  const description = answer.length > 160 ? `${answer.slice(0, 157).trimEnd()}...` : answer;

  return `---
import Layout from '../../../layouts/Layout.astro';

const question = ${JSON.stringify(question)};
const answer = ${JSON.stringify(answer)};
const canonical = '/paa/${slug}/';
const description = ${JSON.stringify(description)};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '${siteUrl}/' },
        { '@type': 'ListItem', position: 2, name: 'PAA', item: '${siteUrl}/paa/' },
        { '@type': 'ListItem', position: 3, name: ${JSON.stringify(question)}, item: '${siteUrl}/paa/${slug}/' },
      ],
    },
  ],
};
---

<Layout
  title=${JSON.stringify(`${question} | Drylining Edinburgh`)}
  description={description}
  canonical={canonical}
  schema={schema}
>
  <main class="container" style="padding: 34px 0 70px;">
    <article class="card" style="padding: 28px; max-width: 860px;">
      <header style="margin-bottom: 22px;">
        <p style="margin: 0 0 10px; color: var(--primary); font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; font-size: 13px;">
          People Also Ask
        </p>
        <h1 style="margin: 0; font-size: clamp(26px, 4vw, 36px); line-height: 1.15;">{question}</h1>
      </header>

      <section style="padding: 18px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 22px;">
        <p style="margin: 0; font-size: 17px; line-height: 1.8; color: var(--text); white-space: pre-wrap;">{answer}</p>
      </section>

      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="/paa/" class="btn btn-outline">Back to PAA Hub</a>
        <a href="/faq/" class="btn btn-outline">View FAQ</a>
        <a href="/get-quote/" class="btn btn-primary">Get a Quote</a>
      </div>
    </article>
  </main>
</Layout>
`;
}

async function updateSitemap(url) {
  let sitemap = await readFile(sitemapPath, 'utf8');
  if (sitemap.includes(`<loc>${url}</loc>`)) return false;
  const entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
  await writeFile(sitemapPath, sitemap);
  return true;
}

async function main() {
  const items = JSON.parse(await readFile(dataPath, 'utf8'));
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  const nextIndex = state.nextIndex ?? 0;

  if (nextIndex >= items.length) {
    return;
  }

  const item = items[nextIndex];
  const slug = slugify(item.question);
  const pageDir = path.join(pagesDir, slug);
  const pagePath = path.join(pageDir, 'index.astro');

  await mkdir(pageDir, { recursive: true });
  await writeFile(pagePath, pageSource({ question: item.question, answer: item.answer, slug }));

  const generated = Array.isArray(state.generated) ? state.generated : [];
  generated.push({
    slug,
    question: item.question,
    createdAt: new Date().toISOString().slice(0, 10),
  });

  await writeFile(statePath, `${JSON.stringify({ nextIndex: nextIndex + 1, generated }, null, 2)}\n`);
  await updateSitemap(`${siteUrl}/paa/${slug}/`);
  await updateSitemap(`${siteUrl}/paa/`);

  process.stdout.write(`${slug}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
