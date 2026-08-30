# S K Enterprises — Website

A ground-up rebuild of the S K Enterprises marketing site. No Mobirise, no Bootstrap, no third-party builder — plain, hand-written HTML/CSS/JS that you fully own and can edit directly.

## What's in here

```
index.html             Full one-page site: hero, about, mission, goals, services, projects, ongoing, why us, team, testimonials, contact
thank-you.html          Redirect target after the contact form is submitted
projects.json           Project list (name, location, area, cost) — edit this to add/remove projects
generate_projects.py    Script that rebuilds the project cards in index.html from projects.json + image folders
google-apps-script.gs   Script that sends contact form submissions from your Gmail (see setup below)
assets/css/main.css     Entire design system (colors, type, layout, components)
assets/js/main.js       Sticky nav, mobile menu, scroll reveal, project auto-slide + lightbox, carousels, contact form
assets/images/          Photos used on the site, resized and compressed for the web
assets/images/projects/ One subfolder per project (e.g. sbi-office/1.jpg, sbi-office/2.jpg, ...)
```

## Design

- **Type:** Fraunces (headlines), Inter (body text), JetBrains Mono (every number — sq ft, years, phone, stats), loaded from Google Fonts.
- **Color:** warm espresso ink, plaster/stone background, brass and deep teal accents (teal pulled from your existing logo mark).
- **Signature detail:** the corner-bracket "spec frame" around key photos and the dimension-tick marquee strip — a nod to floor plans and space planning, which is literally one of your services.
- Fully responsive (mobile nav collapses to a hamburger menu below ~860px), keyboard-focus visible on all interactive elements, and respects `prefers-reduced-motion`.

## Content

All copy (about, mission & vision, goals, services, why-us, team, testimonials, contact details) is sourced from your company profile deck. Team photos and all 38 project photos across the 7 named projects (804 Newa Bhakti Park, Duplex Flat Airoli, Sheth Montana, Clubhouse, B Wing Lobby, Samata Clinic, SBI Office) were extracted directly from that PDF.

Project photos are grouped into a filterable gallery (All / by project name) instead of separate pages — easier to browse, and easier for you to maintain going forward.

## Adding, removing, or updating projects

The "Recent projects" section is generated from two things:

1. **`projects.json`** — one entry per project (name, location, area, cost).
2. **`assets/images/projects/<slug>/`** — a folder per project holding that project's photos, numbered `1.jpg`, `2.jpg`, `3.jpg`, ...

A small script, `generate_projects.py`, reads both and rebuilds the project cards in `index.html` automatically — you never need to hand-edit that part of the page or keep image counts in sync.

**Add a new project:**
1. Create a folder: `assets/images/projects/<slug>/` (e.g. `green-view-apartment`).
2. Drop that project's photos into it, named `1.jpg`, `2.jpg`, `3.jpg`, ...
3. Add an entry to `projects.json` (copy an existing one and edit it):
   ```json
   {
     "slug": "green-view-apartment",
     "name": "Green View Apartment",
     "location": "Thane",
     "area": "1800 sq ft",
     "cost": "₹1.1 Cr"
   }
   ```
4. Run: `python3 generate_projects.py`
5. Re-upload the site.

**Remove a project:** delete its entry from `projects.json` (and optionally its image folder), then run the script again.

**Add or remove a photo in an existing project:** just add/delete the image file inside that project's folder, then run the script. No need to touch `projects.json` or count anything — the script picks up however many images are in the folder and keeps the on-page dots in sync automatically.

The script only ever rewrites the block of `index.html` between the `PROJECTS:AUTO-GENERATED` comments — nothing else on the page is touched. Requires Python 3 (no extra packages) — on Mac/Linux it's pre-installed; on Windows, install it from [python.org](https://www.python.org/downloads/) if `python3 generate_projects.py` doesn't run.

## Contact form — sends via your Gmail

The form no longer uses Salesforce. It now sends straight from your own Gmail account using a small Google Apps Script, with **Reply-To set to the visitor's email** — so when you hit Reply in Gmail, it goes to them, not back to yourself.

**You need to do a one-time, 5-minute setup before the form will work:**

1. Open `google-apps-script.gs` in this folder — it has full step-by-step instructions in the comments at the top.
2. Follow those steps at [script.google.com](https://script.google.com) (paste the code, deploy as a Web App, copy the URL it gives you).
3. Open `assets/js/main.js`, find this line near the top:
   ```js
   var CONTACT_FORM_ENDPOINT = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
   and paste your Web App URL in place of the placeholder text.
4. Re-upload the site.

Until step 3 is done, the form will show a friendly "isn't connected yet" message instead of failing silently — so you'll know right away if it still needs setup.

Submissions arrive as a plain email in the Gmail inbox you deployed the script under, with the visitor's name, email, phone, and message.

## Deploying

Static site, no build step:

1. Upload the whole folder (keeping `index.html` and `assets/` as siblings) to Cloudflare Pages, or any static host.
2. Build command: none. Output directory: `/` (project root).

## Testing locally

Don't open `index.html` by double-clicking it from inside a zip — extract fully first, or better, run a local server from this folder:

```
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser.

## Changing content later

- **Text:** edit directly inside `index.html` — it's plain HTML, organized into clearly commented sections (`<!-- ============ Hero ============ -->` etc.).
- **Colors/fonts:** all defined once at the top of `assets/css/main.css` under `:root` — change a value there and it updates everywhere.
- **Adding a project photo:** drop the image into `assets/images/`, then copy an existing `.project-item` block in the Projects section and update the `src`, `alt`, `data-category`, and `.project-tag` text.
