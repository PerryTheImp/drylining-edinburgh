import json
from pathlib import Path

base = Path.cwd()
paas = json.load(open(base / "src/data/paas.json"))

# Fix /faq/ page to be a directory
def make_slug(q):
    return q.lower().replace("'", "").replace("?", "").replace("–", "-").replace("—", "-").replace(" ", "-")

faq_links = "\n".join([
    f'<li style="border-bottom: 1px solid var(--border); padding: 16px 0;">'
    f'<a href="/drylining-faq/{make_slug(f["question"])}" style="font-size: 1.1rem; font-weight: 600; color: var(--primary); text-decoration: none;">{f["question"]}</a>'
    f'</li>'
    for f in paas
])

faq_page = """---
import Layout from '../layouts/Layout.astro';
import paas from '../data/paas.json';

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\\s]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dryliningedinburgh.co.uk/' },
        { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://dryliningedinburgh.co.uk/faq/' },
      ],
    },
  ],
};
---

<Layout
  title="FAQ | Drylining Edinburgh"
  description="Browse our most asked questions about drylining, partition walls, suspended ceilings and our services in Edinburgh. Click any question to read the full answer."
  canonical="/faq/"
  schema={schema}
>
  <section style="position:relative;min-height:400px;display:flex;align-items:center;background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);overflow:hidden;">
    <img src="/images/trust-badge.jpg" alt="Drylining Edinburgh" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.25;">
    <div class="container" style="position:relative;z-index:1;text-align:center;">
      <h1 style="font-size: 2.5rem; font-weight: 800; color: var(--white); margin-bottom: 1rem;">Frequently Asked Questions</h1>
      <p style="font-size: 1.0625rem; color: rgba(255,255,255,0.85); max-width: 700px; margin: 0 auto;">Browse our most asked questions below. Click any question to read the full answer.</p>
    </div>
  </section>

  <section class="section">
    <div class="container" style="max-width: 800px;">
      <ul style="list-style: none; padding: 0; margin: 0;">
""" + faq_links + """
      </ul>
      <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: var(--accent); border-radius: var(--radius);">
        <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--secondary); margin-bottom: 0.75rem;">Still Have Questions?</h3>
        <p style="color: var(--text-light); margin-bottom: 1.5rem;">Our team is happy to help. Reach out for a free consultation or quote.</p>
        <a href="/get-quote/" class="btn btn-primary">Get a Free Quote</a>
      </div>
    </div>
  </section>
</Layout>
"""

# Write the new /faq/ page
(base / "src/pages/faq.astro").write_text(faq_page, encoding="utf-8")
print("Updated /faq/ to directory")

# Fix all 21 existing PAA pages
for page_dir in (base / "src/pages/drylining-faq").iterdir():
    page_file = page_dir / "index.astro"
    if not page_file.exists():
        continue
    
    content = page_file.read_text(encoding="utf-8")
    
    # Extract question
    question_match = content.split('const question = ')[1].split(';')[0]
    question = json.loads(question_match)
    
    # Extract answer
    answer_match = content.split('const answer = ')[1].split(';')[0]
    answer = json.loads(answer_match)
    
    short = ". ".join(answer.split(". ")[:2]) + "."
    desc = short[:155]
    
    # Generate related links
    related = [p for p in paas if p["question"] != question][:4]
    related_html = "\n".join([
        '<li><a href="/drylining-faq/' + make_slug(r["question"]) + '">' + r["question"] + '</a></li>'
        for r in related
    ])
    
    # Build new page
    new_page = """---
import Layout from '../../../layouts/Layout.astro';

const question = """ + json.dumps(question) + """;
const answer = """ + json.dumps(answer) + """;
const description = """ + json.dumps(desc) + """;
const canonical = '/drylining-faq/""" + make_slug(question) + """/';

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
        { '@type': 'ListItem', position: 3, name: question, item: 'https://dryliningedinburgh.co.uk/drylining-faq/""" + make_slug(question) + """/' },
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
    
    page_file.write_text(new_page, encoding="utf-8")

print("Updated all 21 existing PAA pages")
print("Done.")