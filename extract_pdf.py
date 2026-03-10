import fitz

def convert_pdf_page(pdf_path, img_path):
    print(f"Converting {pdf_path} to {img_path}...")
    try:
        doc = fitz.open(pdf_path)
        page = doc.load_page(0)
        # Increase resolution slightly with a matrix
        zoom = 2.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        pix.save(img_path)
        print(f"Success! Saved to {img_path}")
    except Exception as e:
        print(f"Failed to convert {pdf_path}: {e}")

convert_pdf_page("public/assets/work/TheModernTint Brand Kit.pdf", "public/assets/work/TheModernTint_cover.png")
convert_pdf_page("public/assets/work/FlareUp Brand Kit.pdf", "public/assets/work/FlareUp_cover.png")
