#!/usr/bin/env python3
"""Generate PWA app icons for 绮梦账间"""
import os
from PIL import Image, ImageDraw

# Project color palette
BG_COLOR = (245, 240, 232)    # #f5f0e8 cream
ACCENT_GOLD = (201, 146, 58)  # #c9923a gold
ACCENT_BLUE = (107, 159, 207) # #6b9fcf blue
TEXT_DARK = (61, 52, 39)      # #3d3427

OUT_DIR = os.path.join(os.path.dirname(__file__), 'public', 'icons')
os.makedirs(OUT_DIR, exist_ok=True)

def draw_icon(size):
    """Draw a simple elegant app icon matching the project's warm cream aesthetic."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background circle (cream)
    margin = int(size * 0.1)
    draw.ellipse([margin, margin, size - margin, size - margin],
                 fill=(*BG_COLOR, 255))

    # Inner glow ring (gold accent)
    inner_margin = int(size * 0.15)
    draw.ellipse([inner_margin, inner_margin, size - inner_margin, size - inner_margin],
                 fill=None, outline=(*ACCENT_GOLD, 180), width=max(1, size // 32))

    # Simplified "Qi" character (Qi = 绮) — just a stylized diamond/star shape
    # that evokes "vault/dream" without text
    cx, cy = size // 2, size // 2

    # Outer diamond shape
    r = int(size * 0.28)
    points = [
        (cx, cy - r),          # top
        (cx + int(r * 0.7), cy),  # right
        (cx, cy + r),          # bottom
        (cx - int(r * 0.7), cy), # left
    ]
    draw.polygon(points, fill=(*ACCENT_GOLD, 230), outline=None)

    # Inner cross / star
    inner_r = int(size * 0.12)
    cross_color = BG_COLOR
    # vertical bar
    draw.rectangle([cx - 2, cy - inner_r, cx + 2, cy + inner_r], fill=(*cross_color, 255))
    # horizontal bar
    draw.rectangle([cx - inner_r, cy - 2, cx + inner_r, cy + 2], fill=(*cross_color, 255))

    # Small center dot
    dot_r = max(2, size // 20)
    draw.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r],
                 fill=(*ACCENT_BLUE, 255))

    return img

# Generate 192x192 and 512x512 icons
for size in [192, 512]:
    icon = draw_icon(size)
    filename = f'app-icon-{size}.png'
    path = os.path.join(OUT_DIR, filename)
    icon.save(path, 'PNG')
    print(f'Generated: {path}')

# Also generate a smaller icon for favicon
icon_32 = draw_icon(32)
icon_32.save(os.path.join(OUT_DIR, 'app-icon-32.png'), 'PNG')
print(f'Generated: {OUT_DIR}/app-icon-32.png')

print('Done! All icons generated.')