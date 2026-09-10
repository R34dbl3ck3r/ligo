#!/usr/bin/env python3
"""Resume un reporte JUnit de Playwright en una línea Markdown.

Se usa desde GitHub Actions para dejar el resultado visible en el propio job,
sin tener que descargar el artefacto.
"""
import sys
import xml.etree.ElementTree as ET


def main(path: str) -> int:
    root = ET.parse(path).getroot()
    tests = int(root.get("tests") or 0)
    failures = int(root.get("failures") or 0)
    errors = int(root.get("errors") or 0)
    skipped = int(root.get("skipped") or 0)
    passed = tests - failures - errors - skipped
    icon = "✅" if failures + errors == 0 else "❌"
    print(
        f"{icon} **{passed}/{tests}** pasaron "
        f"(fallos: {failures}, errores: {errors}, omitidos: {skipped})"
    )
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("uso: junit-summary.py <ruta-al-results.xml>", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
