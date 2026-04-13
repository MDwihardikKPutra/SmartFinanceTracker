import zipfile
import xml.etree.ElementTree as ET
import sys

def get_docx_text(path):
    """
    Take the path of a docx file as argument, return the text in html format.
    """
    document = zipfile.ZipFile(path)
    xml_content = document.read('word/document.xml')
    document.close()
    tree = ET.fromstring(xml_content)

    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    paragraphs = []
    for paragraph in tree.findall('.//w:p', ns):
        texts = paragraph.findall('.//w:t', ns)
        if texts:
            paragraphs.append("".join([t.text for t in texts if t.text is not None]))
    return "\n".join(paragraphs)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python read_docx.py <file_path>")
        sys.exit(1)
    
    try:
        text = get_docx_text(sys.argv[1])
        with open("PRD_output.md", "w", encoding="utf-8") as f:
            f.write(text)
        print("Successfully extracted text to PRD_output.md")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
