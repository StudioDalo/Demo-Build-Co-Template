#!/usr/bin/env python3
"""
Makes the clearly-labelled placeholder hero posters and clips in public/placeholders/
(no stock footage, no people, no brands). Needs Pillow and ffmpeg.

  python3 scripts/make-placeholder-media.py "#1f2933" "#4FD1C5"
"""
import subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

dark = sys.argv[1] if len(sys.argv) > 1 else "#1f2933"
accent = sys.argv[2] if len(sys.argv) > 2 else "#4FD1C5"
out = Path(__file__).resolve().parent.parent / "public" / "placeholders"
out.mkdir(parents=True, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
W, H = 1080, 1350
TITLES = [("Hero video 1", "Your best project"), ("Hero video 2", "Work in progress"), ("Hero video 3", "The finished result")]

def font(size): return ImageFont.truetype(FONT, size)

for i, (title, sub) in enumerate(TITLES, 1):
    img = Image.new("RGB", (W, H), dark)
    d = ImageDraw.Draw(img, "RGBA")
    a = tuple(int(accent.lstrip("#")[j:j + 2], 16) for j in (0, 2, 4))
    for x in range(-H, W + H, 120):  # soft diagonal stripes
        d.line([(x, 0), (x + H, H)], fill=a + (60,), width=14)
    d.rounded_rectangle([90, 455, W - 90, 895], radius=28, fill=(0, 0, 0, 170))
    for text, size, colour, y in [("[EDITABLE PLACEHOLDER]", 44, a, 530), (title, 78, (255, 255, 255), 630), (sub, 40, (230, 230, 230), 745), ("Upload your own footage in Studio", 32, (200, 200, 200), 810)]:
        f = font(size)
        w = d.textlength(text, font=f)
        d.text(((W - w) / 2, y), text, font=f, fill=colour)
    poster = out / f"hero-{i}-poster.webp"
    img.save(poster, "WEBP", quality=80)
    png = out / f".hero-{i}.png"
    img.save(png)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(png), "-vf",
                    "scale=1080:1350,zoompan=z='min(zoom+0.0007,1.08)':d=180:s=540x676:fps=30,format=yuv420p",
                    "-t", "6", "-c:v", "libx264", "-crf", "30", "-preset", "slow", "-an", "-movflags", "+faststart", str(out / f"hero-{i}.mp4")], check=True)
    png.unlink()
    print("wrote", poster.name, f"hero-{i}.mp4")
