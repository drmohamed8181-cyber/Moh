# Temporary helper (removed before merge): downloads candidate product photos
# listed in sources.json; for PDFs, extracts embedded images larger than
# 250 px. Results land in photo-candidates/out/ for review.
import json, pathlib, sys, urllib.request
import fitz  # PyMuPDF
from PIL import Image
import io

here = pathlib.Path(__file__).parent
out = here / "out"; out.mkdir(exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (photo review for mpmedpharma.com)"}
for src in json.loads((here / "sources.json").read_text()):
    name, url = src["name"], src["url"]
    try:
        data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
    except Exception as e:
        print(f"FAIL {name}: {e}"); continue
    if url.lower().endswith(".pdf") or data[:4] == b"%PDF":
        doc = fitz.open(stream=data, filetype="pdf")
        n = 0
        for pno, page in enumerate(doc):
            page.get_pixmap(dpi=60).save(out / f"{name}-page{pno+1}.png")
            for img in page.get_images(full=True):
                info = doc.extract_image(img[0])
                im = Image.open(io.BytesIO(info["image"]))
                if min(im.size) < 250: continue
                n += 1
                im.convert("RGBA" if im.mode in ("RGBA","LA","P") else "RGB").save(out / f"{name}-p{pno+1}-{n}.png")
        print(f"OK {name}: pdf, {n} images")
    elif b"<html" in data[:2000].lower() or b"<!doctype" in data[:200].lower():
        import re, urllib.parse
        html = data.decode("utf-8", "ignore")
        (out / f"{name}.html").write_text(html)
        urls = set(re.findall(r'(?:src|data-src|href|content)=["\']([^"\']+\.(?:jpe?g|png|webp)(?:\?[^"\']*)?)', html, re.I))
        urls |= set(re.findall(r'https?://[^"\'\s,]+\.(?:jpe?g|png|webp)', html, re.I))
        n = 0
        for u in sorted(urls):
            u = urllib.parse.urljoin(url, u.replace("&amp;", "&"))
            try:
                b = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read()
                im = Image.open(io.BytesIO(b))
                if min(im.size) < 300: continue
                n += 1
                im.convert("RGBA" if im.mode in ("RGBA","LA","P") else "RGB").save(out / f"{name}-img{n}.png")
                print(f"   {name}-img{n}: {u} {im.size}")
            except Exception:
                pass
        print(f"OK {name}: html, {n} images")
    else:
        im = Image.open(io.BytesIO(data))
        im.save(out / f"{name}.png")
        print(f"OK {name}: {im.size} {im.mode}")
