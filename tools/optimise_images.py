#!/usr/bin/env python3
"""RastaRoots image standard: run from the repo root.

    python3 tools/optimise_images.py          # optimise + rewrite references
    python3 tools/optimise_images.py --check  # report only, exit 1 if any image breaks the rules

Rules (see IMAGES.md):
  * Page images (<img>, CSS, JS): WebP, quality 82 (86 for images with text,
    maps or labels), longest edge max 1920 px.
  * Social/share + structured-data images: JPEG, longest edge 1200 px, quality 82,
    named <name>-share.jpg.
  * Favicons/app icons stay PNG.
  * Budget: page images under 500 KB, share images under 300 KB.
"""
import glob, io, os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
MAX_EDGE = 1920
Q_PHOTO, Q_TEXT = 82, 86
TEXTY = re.compile(r'(map|journey|profile|label|chart|infographic|guide|card)', re.I)
PAGE_BUDGET, SHARE_BUDGET = 500 * 1024, 300 * 1024
SRC_FILES = sorted(glob.glob('*.html') + glob.glob('*.css') + glob.glob('*.js') + glob.glob('assets/*.js'))
REF = re.compile(r'''((?:\./|/|https://www\.rastarootslife\.com/)?(?:assets/)?[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp))(\?v=[0-9]+)?''', re.I)

def norm(p): return re.sub(r'^(\./|/|https://www\.rastarootslife\.com/)', '', p)
def quality(p):
    if re.search(r'(logo|badge)', os.path.basename(p), re.I): return 90
    return Q_TEXT if TEXTY.search(os.path.basename(p)) else Q_PHOTO
def kind(before, path=''):
    """Classify a reference by where it sits: icon, share (og/twitter/JSON-LD) or page."""
    lt, gt = before.rfind('<'), before.rfind('>')
    if lt > gt:  # inside a tag
        tag = before[lt:].lower()
        if tag.startswith('<link') and ('icon' in tag or 'apple-touch' in tag): return 'icon'
        if tag.startswith('<meta') and ('og:image' in tag or 'twitter:image' in tag): return 'share'
        return 'page'
    ld = before.rfind('application/ld+json'); end = before.rfind('</script>')
    if ld > end:  # inside JSON-LD
        if re.search(r'(logo|badge)', os.path.basename(path), re.I): return 'icon'
        return 'share'
    return 'page'

def rgb(im):
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        return im.convert('RGBA')
    return im.convert('RGB')

def fit(im, edge):
    w, h = im.size
    if max(w, h) <= edge: return im
    s = edge / max(w, h)
    return im.resize((round(w * s), round(h * s)), Image.LANCZOS)

def webp_bytes(src, q):
    im = fit(rgb(Image.open(src)), MAX_EDGE)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return b.getvalue(), im.size

def share_jpg(src, dst):
    im = Image.open(src)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (255, 249, 238)); bg.paste(im, mask=im.split()[-1]); im = bg
    else:
        im = im.convert('RGB')
    im = fit(im, 1200)
    im.save(dst, 'JPEG', quality=82, optimize=True, progressive=True)

def same_picture(a, b):
    try:
        A, B = Image.open(a), Image.open(b)
        if abs(A.width / A.height - B.width / B.height) > 0.02: return False
        x = A.convert('L').resize((32, 32)); y = B.convert('L').resize((32, 32))
        d = sum(abs(p - q) for p, q in zip(x.tobytes(), y.tobytes())) / 1024
        return d < 12
    except Exception:
        return False

def scan():
    refs = []
    for f in SRC_FILES:
        s = open(f, encoding='utf-8', errors='ignore').read()
        for m in REF.finditer(s):
            p = norm(m.group(1))
            if os.path.exists(p): refs.append((f, m, p, kind(s[:m.start()], p)))
    return refs

def check():
    bad = []
    for f, m, p, k in scan():
        sz = os.path.getsize(p); ext = os.path.splitext(p)[1].lower()
        if k == 'page' and ext != '.webp': bad.append(f'{f}: page image not WebP: {p}')
        elif k == 'page' and sz > PAGE_BUDGET: bad.append(f'{f}: {p} is {sz//1024} KB (budget 500 KB)')
        elif k == 'share' and sz > SHARE_BUDGET: bad.append(f'{f}: share image {p} is {sz//1024} KB (budget 300 KB)')
    for b in sorted(set(bad)): print(b)
    print(f'{len(set(bad))} problem(s)')
    return 1 if bad else 0

def optimise():
    refs = scan(); done = {}
    before = sum(os.path.getsize(p) for p in {r[2] for r in refs})
    # 1. page images -> webp
    for f, m, p, k in refs:
        ext = os.path.splitext(p)[1].lower()
        if k != 'page' or p in done: continue
        if ext == '.webp':
            data, _ = webp_bytes(p, quality(p))
            if len(data) < os.path.getsize(p) * 0.85: open(p, 'wb').write(data)
            done[p] = p
        else:
            w = os.path.splitext(p)[0] + '.webp'
            if not (os.path.exists(w) and same_picture(p, w)):
                if os.path.exists(w): w = os.path.splitext(p)[0] + '-opt.webp'
                data, _ = webp_bytes(p, quality(p)); open(w, 'wb').write(data)
            else:
                data, _ = webp_bytes(w, quality(w))
                if len(data) < os.path.getsize(w) * 0.85: open(w, 'wb').write(data)
            done[p] = w
    # 2. share/structured-data images -> -share.jpg
    share = {}
    for f, m, p, k in refs:
        if k != 'share' or p in share: continue
        if p.endswith('-share.jpg') and os.path.getsize(p) <= SHARE_BUDGET: share[p] = p; continue
        dst = re.sub(r'(-share)?\.(png|jpe?g|webp)$', '', p, flags=re.I) + '-share.jpg'
        if not os.path.exists(dst) or os.path.getsize(dst) > SHARE_BUDGET: share_jpg(p, dst)
        share[p] = dst
    # 3. rewrite references
    for f in SRC_FILES:
        s = open(f, encoding='utf-8', errors='ignore').read(); out = []; last = 0
        for m in REF.finditer(s):
            p = norm(m.group(1)); k = kind(s[:m.start()], p)
            new = done.get(p) if k == 'page' else share.get(p) if k == 'share' else None
            if not new or new == p: continue
            prefix = m.group(1)[:len(m.group(1)) - len(p)]
            out.append(s[last:m.start()]); out.append(prefix + new + (m.group(2) or '')); last = m.end()
        if out:
            out.append(s[last:]); open(f, 'w', encoding='utf-8').write(''.join(out))
    after_files = set(done.values()) | set(share.values())
    after = sum(os.path.getsize(p) for p in after_files)
    print(f'referenced images: {before/1e6:.1f} MB before -> {after/1e6:.1f} MB after')



# ---------------------------------------------------------------------------
# <img> tag hygiene: width/height (stops layout jumps), lazy-loading below the
# fold. Header images and hero images load straight away.
IMG = re.compile(r'<img\b[^>]*>', re.S)
SRC = re.compile(r'''\bsrc\s*=\s*["']([^"']+)["']''')

def fix_tags():
    changed = 0
    for f in sorted(glob.glob('*.html')):
        s = open(f, encoding='utf-8').read(); out = []; last = 0; first_main = True
        for m in IMG.finditer(s):
            tag = m.group(0); add = []
            src = SRC.search(tag)
            path = norm(src.group(1).split('?')[0]) if src else ''
            before = s[:m.start()]
            in_header = before.rfind('<header') > before.rfind('</header>')
            hero = bool(re.search(r'hero', tag, re.I)) or 'fetchpriority' in tag
            if path and os.path.exists(path) and 'width=' not in tag and 'height=' not in tag:
                try:
                    w, h = Image.open(path).size; add.append(f'width="{w}" height="{h}"')
                except Exception: pass
            if 'loading=' not in tag:
                eager = in_header or hero or (first_main and before.rfind('<main') > -1)
                add.append('decoding="async"' if eager else 'loading="lazy" decoding="async"')
            if before.rfind('<main') > -1 and not in_header: first_main = False
            if add:
                out.append(s[last:m.start()]); out.append('<img ' + ' '.join(add) + tag[4:]); last = m.end()
        if out:
            out.append(s[last:]); open(f, 'w', encoding='utf-8').write(''.join(out)); changed += 1
    print(f'img tags tidied on {changed} pages')


if __name__ == '__main__':
    if '--check' in sys.argv:
        sys.exit(check())
    optimise()
    fix_tags()
