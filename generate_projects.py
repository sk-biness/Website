#!/usr/bin/env python3
"""
S K Enterprises — project cards generator
------------------------------------------
Regenerates the "Recent projects" section in index.html from:
  - projects.json                      (project names, location, area, cost, and order)
  - assets/images/projects/<slug>/     (one folder per project, holding that project's photos)

HOW TO ADD A NEW PROJECT
  1. Create a new folder:  assets/images/projects/<slug>/
     (slug = short id, lowercase, hyphens only, e.g. "green-view-apartment")
  2. Drop that project's photos into the folder, named 1.jpg, 2.jpg, 3.jpg, ...
     (jpg, jpeg, png and webp are all fine — just keep numbering in order)
  3. Add an entry to projects.json (copy an existing one and edit it):
        {
          "slug": "green-view-apartment",
          "name": "Green View Apartment",
          "location": "Thane",
          "area": "1800 sq ft",
          "cost": "\u20b91.1 Cr"
        }
  4. Run this script:  python3 generate_projects.py
  5. Done — index.html is updated automatically. Re-upload the site.

HOW TO REMOVE A PROJECT
  1. Delete its entry from projects.json.
  2. (Optional) delete its folder under assets/images/projects/.
  3. Run:  python3 generate_projects.py

HOW TO ADD/REMOVE A PHOTO IN AN EXISTING PROJECT
  1. Add or delete the image file inside that project's folder.
  2. Run:  python3 generate_projects.py
     (No need to touch projects.json or count anything by hand —
     the script just picks up however many images are in the folder.)

The script only ever touches the block of index.html between the
PROJECTS:AUTO-GENERATED comments — nothing else on the page is changed.
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PROJECTS_JSON = os.path.join(ROOT, "projects.json")
IMAGES_DIR = os.path.join(ROOT, "assets", "images", "projects")
INDEX_HTML = os.path.join(ROOT, "index.html")

START_MARKER = "<!-- PROJECTS:AUTO-GENERATED:START -->"
END_MARKER = "<!-- PROJECTS:AUTO-GENERATED:END -->"

IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")


def natural_key(filename):
    """Sort '2.jpg' before '10.jpg' instead of alphabetically."""
    name = os.path.splitext(filename)[0]
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", name)]


def escape(text):
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def load_projects():
    if not os.path.isfile(PROJECTS_JSON):
        sys.exit("ERROR: projects.json not found at " + PROJECTS_JSON)
    with open(PROJECTS_JSON, encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError as e:
            sys.exit("ERROR: projects.json is not valid JSON — " + str(e))


def images_for(slug):
    folder = os.path.join(IMAGES_DIR, slug)
    if not os.path.isdir(folder):
        return None
    files = [f for f in os.listdir(folder) if f.lower().endswith(IMAGE_EXTENSIONS)]
    files.sort(key=natural_key)
    return files


def build_card(project):
    slug = project["slug"]
    name = project["name"]
    location = project.get("location", "")
    area = project.get("area", "")
    cost = project.get("cost", "")

    files = images_for(slug)
    if files is None:
        print(f'  SKIPPED "{name}" — no folder found at assets/images/projects/{slug}/')
        return None
    if not files:
        print(f'  SKIPPED "{name}" — folder assets/images/projects/{slug}/ has no images')
        return None

    alt = escape(f"{name}, {location} interior" if location else f"{name} interior")
    meta_parts = [p for p in (location, area, cost) if p]
    meta = " &middot; ".join(escape(p) for p in meta_parts)

    slides = []
    dots = []
    for i, fname in enumerate(files):
        active = " is-active" if i == 0 else ""
        src = f"assets/images/projects/{slug}/{fname}"
        slides.append(f'              <img src="{src}" alt="{alt}" class="project-card__slide{active}">')
        dots.append(f'              <span class="dot{active}"></span>')

    card = f'''          <button class="project-card" type="button" data-project="{escape(slug)}">
            <div class="project-card__media">
              <div class="project-card__slides">
{chr(10).join(slides)}
              </div>
              <div class="project-card__dots">
{chr(10).join(dots)}
              </div>
              <span class="project-expand" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>
              </span>
            </div>
            <div class="project-card__info">
              <h3>{escape(name)}</h3>
              <span class="project-card__meta">{meta}</span>
            </div>
          </button>'''

    print(f'  OK "{name}" — {len(files)} image(s)')
    return card


def main():
    if not os.path.isfile(INDEX_HTML):
        sys.exit("ERROR: index.html not found at " + INDEX_HTML)

    projects = load_projects()
    print(f"Loaded {len(projects)} project(s) from projects.json\n")

    cards = []
    for project in projects:
        if "slug" not in project or "name" not in project:
            print("  SKIPPED an entry — missing required 'slug' or 'name' field")
            continue
        card = build_card(project)
        if card:
            cards.append(card)

    if not cards:
        sys.exit("\nERROR: no project cards could be generated — nothing was written.")

    new_block = (
        START_MARKER
        + "\n          <!-- Do not hand-edit the cards below — run generate_projects.py instead. -->\n"
        + "\n".join(cards)
        + "\n          "
        + END_MARKER
    )

    html = open(INDEX_HTML, encoding="utf-8").read()

    if START_MARKER not in html or END_MARKER not in html:
        sys.exit(
            "ERROR: could not find the PROJECTS:AUTO-GENERATED markers in index.html.\n"
            "They may have been accidentally deleted — restore them and try again."
        )

    pattern = re.compile(re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER), re.DOTALL)
    new_html, n = pattern.subn(new_block, html, count=1)

    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(new_html)

    print(f"\nDone — index.html updated with {len(cards)} project card(s).")


if __name__ == "__main__":
    main()
