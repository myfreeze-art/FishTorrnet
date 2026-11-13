import re
import subprocess
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = HERE / "out"

mark_svg = (ROOT / "assets/mark-light.svg").read_text(encoding="utf-8")
mark_inner = re.search(r"<svg[^>]*>(.*)</svg>", mark_svg, re.S).group(1)
mark_dark_inner = re.search(r"<svg[^>]*>(.*)</svg>", (ROOT / "assets/mark-dark.svg").read_text(encoding="utf-8"), re.S).group(1)


def mark(x, y, size, dark=False):
    inner = (mark_dark_inner if dark else mark_inner).replace('id="c-', f'id="m{x}{y}-')
    inner = inner.replace("url(#c-", f"url(#m{x}{y}-")
    s = size / 48
    return f'<g transform="translate({x} {y}) scale({s}) translate(-8 -8)">{inner}</g>'


def render(name, svg, width, height, fmt):
    OUT.mkdir(exist_ok=True)
    src = OUT / f"{name}.svg"
    src.write_text(svg, encoding="utf-8")
    png = OUT / f"{name}.png"
    subprocess.run(["rsvg-convert", "-w", str(width), "-h", str(height), str(src), "-o", str(png)], check=True)
    if fmt == "bmp":
        Image.open(png).convert("RGB").save(HERE / f"{name}.bmp")
    else:
        Image.open(png).save(HERE / f"{name}.png")
    src.unlink()
    png.unlink()


FONT = "font-family=\"Inter\""
DARK = "#141417"
CORAL = "#FF6A3D"


def sidebar(w, h):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
<radialGradient id="glow" cx="50%" cy="100%" r="80%">
<stop offset="0" stop-color="{CORAL}" stop-opacity="0.28"/>
<stop offset="1" stop-color="{CORAL}" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="{w}" height="{h}" fill="{DARK}"/>
<rect width="{w}" height="{h}" fill="url(#glow)"/>
<rect x="{w/2-36}" y="{h*0.30-36}" width="72" height="72" rx="17" fill="#ffffff"/>
{mark(w/2-28, h*0.30-28, 56)}
<text x="{w/2}" y="{h*0.30+66}" {FONT} font-size="17" font-weight="600" fill="#ffffff" text-anchor="middle">FishTorrnet</text>
<rect x="{w/2-14}" y="{h*0.30+80}" width="28" height="2" rx="1" fill="{CORAL}"/>
</svg>'''


def header(w, h):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<rect width="{w}" height="{h}" fill="#ffffff"/>
{mark(w-h+6, 7, h-14)}
</svg>'''


def wix_banner(w, h):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<rect width="{w}" height="{h}" fill="#ffffff"/>
<rect y="{h-2}" width="{w}" height="2" fill="{CORAL}"/>
{mark(w-h-4, 8, h-16)}
</svg>'''


def wix_dialog(w, h):
    side = 164
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
<radialGradient id="glow" cx="50%" cy="100%" r="80%">
<stop offset="0" stop-color="{CORAL}" stop-opacity="0.28"/>
<stop offset="1" stop-color="{CORAL}" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="{w}" height="{h}" fill="#ffffff"/>
<rect width="{side}" height="{h}" fill="{DARK}"/>
<rect width="{side}" height="{h}" fill="url(#glow)"/>
<rect x="{side/2-34}" y="{h*0.34-34}" width="68" height="68" rx="16" fill="#ffffff"/>
{mark(side/2-26, h*0.34-26, 52)}
<text x="{side/2}" y="{h*0.34+62}" {FONT} font-size="16" font-weight="600" fill="#ffffff" text-anchor="middle">FishTorrnet</text>
<rect x="{side/2-13}" y="{h*0.34+75}" width="26" height="2" rx="1" fill="{CORAL}"/>
</svg>'''


def dmg(w, h):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
<radialGradient id="glow" cx="50%" cy="115%" r="70%">
<stop offset="0" stop-color="{CORAL}" stop-opacity="0.16"/>
<stop offset="1" stop-color="{CORAL}" stop-opacity="0"/>
</radialGradient>
<marker id="head" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
<path d="M0 0 L8 5 L0 10" fill="none" stroke="#17171a" stroke-opacity="0.45" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</marker>
</defs>
<rect width="{w}" height="{h}" fill="#f7f7f8"/>
<rect width="{w}" height="{h}" fill="url(#glow)"/>
<text x="{w/2}" y="58" {FONT} font-size="22" font-weight="600" fill="#17171a" text-anchor="middle">FishTorrnet</text>
<text x="{w/2}" y="84" {FONT} font-size="13" fill="#5d5d66" text-anchor="middle">Drag FishTorrnet to Applications</text>
<path d="M{w/2-70} 190 C {w/2-25} 168, {w/2+25} 168, {w/2+70} 190" fill="none" stroke="#17171a" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="6 7" stroke-linecap="round" marker-end="url(#head)"/>
</svg>'''


render("nsis-sidebar", sidebar(164, 314), 164, 314, "bmp")
render("nsis-header", header(150, 57), 150, 57, "bmp")
render("wix-banner", wix_banner(493, 58), 493, 58, "bmp")
render("wix-dialog", wix_dialog(493, 312), 493, 312, "bmp")
render("dmg-background", dmg(660, 400), 660, 400, "png")
OUT.rmdir()
print("ok")
