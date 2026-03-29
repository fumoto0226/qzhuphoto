from __future__ import annotations

import argparse
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "img" / "programs"
OUTPUT_DIR = ROOT / "img" / "programs-thumbs"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
MAGICK = Path("/Applications/MAMP/Library/bin/magick")


def iter_images(folder_filters: list[str] | None = None) -> list[Path]:
    search_roots = [SOURCE_DIR]
    if folder_filters:
        search_roots = [SOURCE_DIR / folder_filter for folder_filter in folder_filters]

    images: list[Path] = []
    for search_root in search_roots:
        if not search_root.exists():
            continue
        images.extend(
            path
            for path in search_root.rglob("*")
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        )

    return sorted(images)


def thumbnail_path_for(source_path: Path) -> Path:
    relative = source_path.relative_to(SOURCE_DIR)
    return OUTPUT_DIR / relative.with_suffix(".webp")


def needs_regeneration(source_path: Path, target_path: Path) -> bool:
    if not target_path.exists():
        return True
    return source_path.stat().st_mtime > target_path.stat().st_mtime


def generate_thumbnail(source_path: Path, target_path: Path) -> None:
    target_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            str(MAGICK),
            str(source_path),
            "-auto-orient",
            "-resize",
            "160x160^",
            "-gravity",
            "center",
            "-extent",
            "160x160",
            "-quality",
            "68",
            str(target_path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("folders", nargs="*", help="Optional folder filters relative to img/programs")
    args = parser.parse_args()

    images = iter_images(args.folders or None)
    to_generate: list[tuple[Path, Path]] = []
    skipped = 0

    for source_path in images:
        target_path = thumbnail_path_for(source_path)
        if needs_regeneration(source_path, target_path):
            to_generate.append((source_path, target_path))
        else:
            skipped += 1

    worker_count = min(8, max(1, (os.cpu_count() or 4) - 1))
    if to_generate:
        with ThreadPoolExecutor(max_workers=worker_count) as executor:
            list(executor.map(lambda args: generate_thumbnail(*args), to_generate))
    generated = len(to_generate)

    print(
        f"Processed {len(images)} images: generated {generated}, skipped {skipped}. "
        f"Output root: {OUTPUT_DIR.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()
