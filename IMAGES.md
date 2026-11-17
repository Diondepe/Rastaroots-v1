# RastaRoots image standard

Every image on www.rastarootslife.com follows these rules so pages load fast
without losing quality. `tools/optimise_images.py` applies them automatically.

## The rules

| Use | Format | Size | Quality | Budget |
| --- | --- | --- | --- | --- |
| Images on the page (`<img>`, CSS, JS) | WebP | Longest edge up to 1920 px (most are 1536 px) | 82 for photos; 86 for images with text, maps or labels; 90 for logos | Under 500 KB |
| Social share and Google (og:image, twitter:image, JSON-LD) | JPEG, named `<name>-share.jpg` | Longest edge 1200 px | 82 | Under 300 KB |
| Favicon / logo in structured data | PNG | 256 px | lossless | Under 100 KB |

Every `<img>` also gets:
- `width` and `height` (stops the page jumping as images load);
- `loading="lazy"` unless it is in the header, a hero image, or the first
  image on the page (those load straight away);
- `decoding="async"`.

## Adding a new image

1. Export from ChatGPT / Canva / camera at any size, as PNG or JPG.
2. Save it in the right `assets/` folder with a clear, hyphenated name,
   e.g. `assets/botanicals/ginger-heritage-journey.png`. Put words like `map`,
   `label` or `profile` in the name if the picture contains text, so it gets
   the higher quality setting.
3. Reference it in the page as normal.
4. From the repo folder run:

   ```
   python3 tools/optimise_images.py
   ```

   It creates the WebP and share JPEG versions, rewrites the page references,
   adds width/height and lazy loading, and prints the before/after size.
5. Check nothing breaks the rules:

   ```
   python3 tools/optimise_images.py --check
   ```

Original PNG/JPG files can stay in the repo; pages no longer load them.
