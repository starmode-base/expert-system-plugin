#!/usr/bin/env python3
"""Build a plugin-only archive; never distribute the application or local secrets."""
import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    "plugin.json", "mcp.json", ".mcp.json", ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json", ".codex-plugin/plugin.json",
    ".agents/plugins/marketplace.json", "README.md",
    "documents/plugin-release.md",
]
for skill in ("research", "macro", "financials"):
    FILES.extend([f"skills/{skill}/SKILL.md", f"skills/{skill}/agents/openai.yaml"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Destination .zip file")
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(args.output, "w", ZIP_DEFLATED) as archive:
        for name in FILES:
            path = ROOT / name
            if path.is_symlink() or not path.is_file():
                raise SystemExit(f"Expected regular plugin file: {name}")
            archive.write(path, f"expert-system/{name}")
    print(f"Packaged {len(FILES)} files: {args.output}")


if __name__ == "__main__":
    main()
