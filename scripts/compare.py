"""Side-by-side review sheets: Figma | build before | build after, one per section.
Usage: python3 scripts/compare.py [after_dir] [out_dir]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

ref, before = 'design/figma-ref', 'design/build-before'
after = sys.argv[1] if len(sys.argv) > 1 else 'design/build-after'
out = sys.argv[2] if len(sys.argv) > 2 else 'design/compare'
os.makedirs(out, exist_ok=True)

pairs = {
    'd-header': 'd-header', 'd-hero': 'd-hero', 'd-gives': 'd-gives', 'd-work-in': 'd-work-in',
    'd-work-with': 'd-work-with', 'd-back': 'd-back', 'd-leave': 'd-leave',
    'd-overlay-operator': 'd-role-operator', 'd-received': 'd-received',
    'm-hero': 'm-hero', 'm-back': 'm-back', 'm-leave': 'm-leave', 'm-sheet-operator': 'm-role-operator',
}
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 22)
except OSError:
    font = ImageFont.load_default()

for fig, build in pairs.items():
    imgs = []
    for label, d, name in (('Figma', ref, fig), ('Before', before, build), ('After', after, build)):
        p = os.path.join(d, name + '.png')
        if os.path.exists(p):
            imgs.append((label, Image.open(p).convert('RGB')))
    if len(imgs) < 2:
        continue
    w = max(i.width for _, i in imgs)
    h = max(i.height for _, i in imgs)
    gap, head = 24, 44
    sheet = Image.new('RGB', (len(imgs) * w + (len(imgs) - 1) * gap, h + head), (235, 235, 235))
    dr = ImageDraw.Draw(sheet)
    for n, (label, im) in enumerate(imgs):
        x = n * (w + gap)
        sheet.paste(im, (x, head))
        dr.text((x + 8, 10), f'{label}  {im.width}x{im.height}', fill=(17, 17, 17), font=font)
    sheet.save(os.path.join(out, fig + '.png'))
    print(fig, sheet.size)
