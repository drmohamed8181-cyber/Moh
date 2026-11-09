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
    else:
        im = Image.open(io.BytesIO(data))
        im.save(out / f"{name}.png")
        print(f"OK {name}: {im.size} {im.mode}")
