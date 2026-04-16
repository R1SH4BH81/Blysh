import os
import re
import sys
from pathlib import Path

# Configuration
REPO_OWNER = "R1SH4BH81"
REPO_NAME = "Blysh"
BRANCH = "main"
SRC_DIR = ".qoder/repowiki/en/content"
GITHUB_URL_BASE = f"https://github.com/{REPO_OWNER}/{REPO_NAME}/blob/{BRANCH}"

def transform_content(content):
    # 1. Transform <cite> tags to collapsible details
    def cite_replacer(match):
        cite_content = match.group(1).strip()
        return f"\n\n<details>\n<summary><b>📖 Sources & References</b></summary>\n\n{cite_content}\n\n</details>\n\n"

    content = re.sub(r"<cite>(.*?)</cite>", cite_replacer, content, flags=re.DOTALL)

    # 2. Rewrite file:// links to GitHub URLs
    # Pattern: [text](file://path#fragments)
    def link_replacer(match):
        text = match.group(1)
        path = match.group(2)
        # Remove leading // if present
        if path.startswith("//"):
            path = path[2:]
        
        # Construct GitHub URL
        github_url = f"{GITHUB_URL_BASE}/{path}"
        return f"[{text}]({github_url})"

    content = re.sub(r"\[([^\]]+)\]\(file:\/\/([^\)]+)\)", link_replacer, content)

    return content

def generate_sidebar(content_dir):
    sidebar_content = "## Navigation\n\n"
    
    # Simple recursive directory listing for sidebar
    for root, dirs, files in os.walk(content_dir):
        level = root.replace(content_dir, '').count(os.sep)
        indent = "  " * level
        folder_name = os.path.basename(root)
        
        if folder_name and folder_name != "content":
            sidebar_content += f"{indent}- **{folder_name}**\n"
        
        for f in sorted(files):
            if f.endswith(".md"):
                name = f[:-3]
                # In GitHub Wiki, links are usually [[Page Name]] or [Page Name](Page-Name)
                # We'll use the relative path format for better compatibility
                rel_path = os.path.join(root, f).replace(content_dir, "").lstrip(os.sep)
                link_name = name.replace(" ", "-")
                sidebar_content += f"{indent}  - [[{name}]]\n"
                
    return sidebar_content

def main():
    base_path = Path(SRC_DIR)
    if not base_path.exists():
        print(f"Error: Source directory {SRC_DIR} not found.")
        sys.exit(1)

    print(f"Transforming files in {SRC_DIR}...")
    
    # We will output to a 'wiki_output' directory
    output_dir = Path("wiki_output")
    output_dir.mkdir(exist_ok=True)

    for md_file in base_path.rglob("*.md"):
        print(f"Processing {md_file.name}...")
        content = md_file.read_text(encoding="utf-8")
        transformed = transform_content(content)
        
        # Maintain directory structure for the wiki or flatten?
        # GitHub Wiki supports subdirectories but links can be tricky.
        # We'll maintain structure for now.
        rel_path = md_file.relative_to(base_path)
        dest_file = output_dir / rel_path
        dest_file.parent.mkdir(parents=True, exist_ok=True)
        dest_file.write_text(transformed, encoding="utf-8")

    # Generate Sidebar
    print("Generating _Sidebar.md...")
    sidebar = generate_sidebar(SRC_DIR)
    (output_dir / "_Sidebar.md").write_text(sidebar, encoding="utf-8")
    
    print(f"\nSuccess! Transformed files are in {output_dir}")

if __name__ == "__main__":
    main()
