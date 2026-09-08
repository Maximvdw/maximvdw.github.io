#!/usr/bin/env python3
"""
Generate 800x400 social media banners (matching images/social/summary-large.png)
for publications: poster as background, indigo overlay, bold white title.

Usage:
    python3 _scripts/make-social-banner.py <poster.png> "<title>" <output.png> ["<authors>"]

If <authors> is omitted, maximvdw.be is shown in the bottom line instead.
Abbreviate first names when the author list is long (e.g. "M. Van de Wynckel").

Font: Nimbus Sans Bold (URW's metric-compatible ITC Avant Garde Gothic clone).
Requires: pip install pillow
"""
import sys
from PIL import Image, ImageDraw, ImageFont

W, H = 800, 400
BOLD = "/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf"
OVERLAY_TOP = (23, 36, 110, 175)
OVERLAY_BOTTOM = (23, 36, 110, 250)
LABEL = "SEMANTICS 2026"
SITE = "maximvdw.be"


def wrap(draw, text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def banner(postersrc, title, out, authors=None):
    bg = Image.open(postersrc).convert("RGB")
    scale = W / bg.width
    bg = bg.resize((W, int(bg.height * scale)), Image.LANCZOS)
    top = (bg.height - H) // 2
    bg = bg.crop((0, top, W, top + H))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(H):
        t = y / (H - 1)
        a = tuple(int(OVERLAY_TOP[i] + (OVERLAY_BOTTOM[i] - OVERLAY_TOP[i]) * t) for i in range(4))
        od.line([(0, y), (W, y)], fill=a)
    img = Image.alpha_composite(bg.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(img)
    pad = 48
    max_w = W - 2 * pad

    label_f = ImageFont.truetype(BOLD, 24)
    d.text((pad, 40), LABEL, font=label_f, fill=(214, 222, 255))

    subtitle = authors or SITE
    asize = 32
    while asize >= 22:
        af = ImageFont.truetype(BOLD, asize)
        alines = wrap(d, subtitle, af, max_w)
        if len(alines) <= 2:
            break
        asize -= 1
    aline_h = int(asize * 1.22)

    size = 40
    while size >= 26:
        f = ImageFont.truetype(BOLD, size)
        lines = wrap(d, title, f, max_w)
        if len(lines) <= 3:
            break
        size -= 1
    line_h = int(size * 1.22)
    block = line_h * len(lines) + 14 + aline_h * len(alines)
    y0 = H - 44 - block
    for i, line in enumerate(lines):
        d.text((pad, y0 + i * line_h), line, font=f, fill=(255, 255, 255), stroke_width=2, stroke_fill=(15, 22, 70))
    y1 = y0 + line_h * len(lines) + 14
    for i, line in enumerate(alines):
        d.text((pad, y1 + i * aline_h), line, font=af, fill=(255, 255, 255), stroke_width=2, stroke_fill=(15, 22, 70))

    img.save(out, "PNG", optimize=True)
    print(out)


if __name__ == "__main__":
    if len(sys.argv) not in (4, 5):
        sys.exit(__doc__)
    banner(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) == 5 else None)
