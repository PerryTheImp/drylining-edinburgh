import json, os
from pathlib import Path

base = Path.cwd()
paas = json.load(open(base / "src/data/paas.json"))

# Get existing slugs
existing = set()
for d in (base / "src/pages/drylining-faq").iterdir():
    if d.is_dir():
        existing.add(d.name)

def make_slug(q):
    return q.lower().replace("'", "").replace("?", "").replace("–", "-").replace("—", "-").replace(" ", "-")

all_slugs = {make_slug(p["question"]): p for p in paas}
missing_slugs = set(all_slugs.keys()) - existing

print(f"Total: {len(all_slugs)}, Existing: {len(existing)}, Missing: {len(missing_slugs)}")

for s in sorted(missing_slugs):
    q = all_slugs[s]["question"]
    a = all_slugs[s]["answer"]
    short = ". ".join(a.split(". ")[:2]) + "."
    desc = short[:155]
    
    related = []
    for other_q, other_p in all_slugs.items():
        if other_q != s:
            related.append(other_p)
            if len(related) >= 4:
                break
    
    related_html = "\n".join([
        '<li><a href="/drylining-faq/%s">%s</a></li>' % (make_slug(r["question"]), r["question"])
        for r in related
    ])
    
    page = """---
import Layout from '../../../layouts/Layout.astro';

const question = """ + json.dumps(q) + """;
const answer = """ + json.dumps(a) + """;
const description = """ + json.dumps(desc) + """;
const canonical = '/drylining-faq/""" + s + """/';

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dryliningedinburgh.co.uk/' },
        { '@type': 'ListItem', position: 2, name: 'PAA', item: 'https://dryliningedinburgh.co.uk/faq/' },
        { '@type': 'ListItem', position: 3, name: question, item: 'https://dryliningedinburgh.co.uk/drylining-faq/""" + s + """/' },
      ],
    },
  ],
};
---

<Layout
  title={question + ' | Drylining Edinburgh'}
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
        <p style="margin: 0; font-size: 17px; line-height: 1.8; color: var(--text);">{answer}</p>
      </section>

      <section style="margin: 24px 0; padding: 18px 0; border-top: 1px solid var(--border);">
        <h3 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--text);">Related Questions</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
""" + related_html + """
        </ul>
      </section>

      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px;">
        <a href="/faq/" class="btn btn-outline">All FAQs</a>
        <a href="/get-quote/" class="btn btn-primary">Get a Quote</a>
      </div>
    </article>
  </main>
</Layout>
"""
    
    out_dir = base / "src/pages/drylining-faq" / s
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.astro").write_text(page, encoding="utf-8")
    print("  Created: %s" % s)

print("\nDone.")