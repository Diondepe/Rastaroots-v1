"""Build the launch-day schedule Instagram Story (1080x1920 JPEG) in the 22 Nov brand style."""
import subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

OUT = sys.argv[1] if len(sys.argv) > 1 else "assets/social/2026-11-29/story-launch-schedule.jpg"
W, H = 1080, 1920
GREEN, CREAM, GOLD = (16, 60, 37), (255, 244, 220), (232, 190, 90)
G = "/usr/share/fonts/truetype/google-fonts/ofl/"
HEAD = "/mnt/skills/examples/canvas-design/canvas-fonts/EricaOne-Regular.ttf"
BOLD = G + "firasans/FiraSans-ExtraBold.ttf"
SEMI = G + "firasans/FiraSans-SemiBold.ttf"
f = lambda p, s: ImageFont.truetype(p, s)

# Background: real launch-week footage (sachets in the box), blurred and darkened
frame = "/tmp/rr_bg.png"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", "6", "-i",
                "assets/social/2026-11-22/theyve-landed-reel.mp4", "-frames:v", "1", frame], check=True)
bg = Image.open(frame).convert("RGB")
bw, bh = bg.size
bg = bg.crop((0, int(bh * 0.3), bw, bh))  # drop baked-in headline
scale = max(W / bg.width, H / bg.height)
bg = bg.resize((int(bg.width * scale) + 1, int(bg.height * scale) + 1), Image.LANCZOS)
bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H))
bg = bg.filter(ImageFilter.GaussianBlur(22))
bg = ImageEnhance.Brightness(bg).enhance(0.42)
img = Image.alpha_composite(bg.convert("RGBA"), Image.new("RGBA", (W, H), (6, 23, 14, 90)))
d = ImageDraw.Draw(img)


def centred(y, text, font, fill=CREAM, shadow=True):
    w = d.textlength(text, font=font)
    x = (W - w) / 2
    if shadow:
        d.text((x + 3, y + 4), text, font=font, fill=(0, 0, 0, 150))
    d.text((x, y), text, font=font, fill=fill)
    return x, w


def chip(x, y, text, font, pad=(18, 8), fill=GREEN, color=CREAM):
    l, t, r, b = d.textbbox((0, 0), text, font=font)
    d.rounded_rectangle((x, y, x + r + pad[0] * 2, y + (b - t) + pad[1] * 2 + 4), 16, fill=fill)
    d.text((x + pad[0], y + pad[1] - t + 2), text, font=font, fill=color)
    return r + pad[0] * 2


def poster(y, text, size):
    """Cream fill, green stroke, gold offset shadow (reggae-sleeve lettering)."""
    font = f(HEAD, size)
    w = d.textlength(text, font=font)
    x = (W - w) / 2
    d.text((x + 9, y + 10), text, font=font, fill=GOLD, stroke_width=9, stroke_fill=GOLD)
    d.text((x, y), text, font=font, fill=CREAM, stroke_width=9, stroke_fill=GREEN)


# Top chip
lab = f(BOLD, 40)
lw = d.textlength("OFFICIAL LAUNCH · TOMORROW", font=lab) + 36
chip((W - lw) / 2, 150, "OFFICIAL LAUNCH · TOMORROW", lab)

poster(240, "DI RUN", 150)
poster(400, "OF SHOW.", 150)

centred(642, "Sunday 29 November · 1:30–4:30pm", f(BOLD, 46))
centred(704, "Windrush Millennium Centre, Manchester", f(SEMI, 38), fill=(255, 244, 220, 230))

# Schedule rows
rows = [
    ("1:30", "Doors · welcome drinks · DJ"),
    ("2:00", "Official welcome"),
    ("2:10", "Founder story: heritage, herbs, vision"),
    ("2:30", "Tea & coffee tasting · cakes & cookies"),
    ("3:10", "Q&A · tell us what you think"),
    ("3:25", "DJ · networking · shop the blends"),
    ("4:05", "Group photo + closing words"),
    ("4:20", "Last orders & farewell"),
]
tf, rf = f(BOLD, 44), f(SEMI, 40)
y = 830
left = 92
for t, txt in rows:
    cw = chip(left, y, t, tf, pad=(16, 6), fill=GOLD, color=GREEN)
    d.text((left + 150 + 3, y + 8 + 3), txt, font=rf, fill=(0, 0, 0, 150))
    d.text((left + 150, y + 8), txt, font=rf, fill=CREAM)
    y += 100

# Footer
y += 30
d.line((300, y, W - 300, y), fill=GOLD + (200,), width=3)
centred(y + 40, "Come thirsty. Leave rooted.", f(BOLD, 50))
foot = f(BOLD, 42)
a, b = "Don't lose your ", "rootz"
tw = d.textlength(a, font=foot) + d.textlength(b, font=foot) + 36 + 90
x = (W - tw) / 2
d.text((x + 3, y + 134), a, font=foot, fill=(0, 0, 0, 150))
d.text((x, y + 130), a, font=foot, fill=CREAM)
x += d.textlength(a, font=foot)
x += chip(x, y + 136, b, foot)
# black/green/gold dots in place of emoji (no colour-emoji font here)
for i, c in enumerate([(10, 10, 10), (40, 160, 80), GOLD]):
    cx = x + 22 + i * 30
    d.ellipse((cx, y + 152, cx + 22, y + 174), fill=c, outline=CREAM, width=2)

img.convert("RGB").save(OUT, quality=90)
print(OUT)
