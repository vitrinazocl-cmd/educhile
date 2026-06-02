import os
import zipfile
import xml.etree.ElementTree as ET
import json

toolkit_dir = r"C:\Users\ext_jmena\OneDrive - Falabella\Escritorio\paginas web\clasesonline\TOOLKIT EDITABLE UNIDAD 1-20260518"
files = [f for f in os.listdir(toolkit_dir) if f.endswith('.docx')]
files.sort()

def extract_text(docx_path):
    text = []
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            # Find all text nodes
            for node in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                if node.text:
                    text.append(node.text)
    except Exception as e:
        return str(e)
    return " ".join(text)

results = {}
for f in files:
    path = os.path.join(toolkit_dir, f)
    results[f] = extract_text(path)

with open(r"C:\Users\ext_jmena\OneDrive - Falabella\Escritorio\paginas web\clasesonline\extracted_info.json", "w", encoding="utf-8") as out:
    json.dump(results, out, ensure_ascii=False, indent=2)

print("Extraction complete.")
