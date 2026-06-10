# Shvaan Pet Care — Marketing Website

A 4-page public website to attract new customers, brand-matched to your app
(same orange theme, logo, and fonts). Separate from the operations app.

## Pages
- **home.html** — hero, value highlights, services preview, "why us", testimonials, CTA
- **services.html** — Boarding & Day Care details + pricing, requirements, what to bring
- **about.html** — your story, your space, your promise
- **contact.html** — phone/email/location/hours, map, FAQ
- **site.css** — shared styles for all pages

## How it connects to your existing tools
- **"Request Booking"** buttons link to `book.html` (your public booking form)
- **"Client Login"** buttons link to `index.html` (your app)
- Adjust those paths at the top of each page if your app lives in a subfolder.

## Fill in your content
Search each page for **`[[ ... ]]`** — every placeholder is marked that way.
Replace them with your real details:
- Tagline & intro sentences (home)
- Rates and what's included (services)
- Vaccination/what-to-bring/cancellation policies (services)
- Your story, space description, photos (about)
- Phone, email, address/service area, hours, social links (contact + footer)
- Real testimonials (home) — or delete that section until you have them
- FAQ answers (contact)

## Photos (highest impact!)
Each `🐾 / 🐕` placeholder box marks where a photo goes. Replace the placeholder
`<div class="ph">…</div>` with `<img src="your-photo.jpg" alt="...">`.
Real photos of your actual space and happy dogs will do more to win customers
than anything else on the page.

## Publishing
These are plain static files — host them the same way as the app (GitHub Pages).
Common setup: make **home.html** your site's front page (or rename it `index.html`
and move the app to an `/app/` subfolder). Keep all files together so `site.css`
and the links resolve.

## Honest notes
- Built with tasteful placeholders; it will look generic until you add your real
  words and photos. Prioritize a few good photos + your story.
- Only use **real** testimonials — a simple honest page beats a polished one with
  fabricated reviews.
