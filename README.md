# Intensive Pest Management

Static marketing website. No framework, no build step, no runtime dependencies.

## Run it locally

```bash
python3 -m http.server 8099
# open http://localhost:8099
```

Any static host works: Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, or plain nginx.
Upload the repository root as-is.

## Files

```
index.html          Home
services.html       Residential and commercial services
method.html         Method, standards, and credentials
contact.html        Quote request form
credits.html        Photo credits and licences for the stock photography
404.html            Not found page
robots.txt          Crawler rules
sitemap.xml         Sitemap
assets/css/styles.css   Design system, single stylesheet
assets/js/main.js       Navigation, scroll reveal, form handling
assets/fonts/           Self-hosted Geist and Geist Mono (variable woff2)
assets/img/             Photography, icon favicon, social card
```

## What to replace before launch

Everything in this table is a placeholder or an unverified claim. Nothing else in the site is
business-specific, so this is the whole list.

| Where | Current value | What to do |
|---|---|---|
| Phone number, all pages | `(519) 555-0147` and `tel:+15195550147` | Replace with the real number. 555-01xx is a reserved fictional range. |
| Email, all pages | `hello@intensivepest.ca` | Replace with the real inbox. |
| Address, footer and contact page | `470 Elliott St E, Windsor, ON` | Verify against the real place of business. |
| Domain, canonical and OG tags, `robots.txt`, `sitemap.xml` | `https://intensivepest.ca` | Replace with the live domain, then update `sitemap.xml` and the JSON-LD blocks. |
| Licence claim, footer and method page | "Licensed and insured in Ontario" | Add the real Ontario pesticide licence number and insurer details, or remove the claim. |
| Opening hours | Mon to Fri 7am to 6pm, Sat 8am to 2pm | Confirm the real hours. |
| Service area list | Windsor and Essex County municipalities | Confirm which areas are actually served. |
| Guarantee wording, home and method pages | "return and re-treat at no charge" | Confirm this matches the real service terms. |
| Treatment and follow-up table, services page | Product classes and intervals | Have a licensed applicator confirm the specifics before publishing. |
| Response times, contact page | "Within one business day" | Confirm or remove. |

## The contact form

`assets/js/main.js` has one constant at the top of the form section:

```js
var FORM_ENDPOINT = '';
```

* **Empty (current):** the form validates, then hands the completed message to the visitor's mail
  client with `mailto:`. It never silently drops a submission.
* **Set:** the form posts JSON to that URL and shows sending, success, and error states. Works with
  Formspree, Netlify Forms, Basin, or any endpoint that accepts `POST` JSON.

The form also has a honeypot field (`name="company"`) that is invisible to people.

## Design system notes

* One accent colour for the whole site (`--accent`, deep pine `#0e6b4f`). White text on it passes
  WCAG AA at 6.6:1.
* One theme for the whole site. No section inverts to a dark panel.
* Shape rule, applied everywhere: containers 20px, media nested in containers 14px, inputs 12px,
  interactive controls pill.
* Type is self-hosted Geist and Geist Mono, variable weight, latin and latin-ext subsets, 84KB total.
* Motion is CSS and IntersectionObserver only. Every animation uses `transform` and `opacity`, and
  everything is disabled under `prefers-reduced-motion`.
* Icons are Phosphor (MIT), vendored as an inline SVG sprite at the top of each page. No icon
  library is loaded at runtime.

## Accessibility

* Skip link, landmark elements, and one `h1` per page.
* Visible focus rings on every interactive element.
* Mobile menu traps focus, closes on Escape, and restores focus to the trigger.
* Form errors are announced through `aria-live` and tied to their fields with `aria-invalid`.
* No text below 12px. Colour pairs used for text meet WCAG AA.

## Photography

All photographs are Creative Commons or public domain and are listed in `credits.html` with their
source, author, and licence. `assets/img/manifest.json` records the same data in machine-readable
form.

Each photo has a `-700.webp` sibling used through `srcset` for narrow viewports and small cards, so
phones never download the full-size file. To swap an image, replace both files at the same aspect
ratio (`name.webp` and `name-700.webp`) and the layout will not shift. If you replace the stock
photography with your own, update `manifest.json` and `credits.html`, or delete `credits.html` and
its footer link.
