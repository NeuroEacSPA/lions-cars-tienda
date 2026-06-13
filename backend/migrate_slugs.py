"""
migrate_slugs.py
================
Ejecutar UNA SOLA VEZ en el servidor para generar slugs
a todos los vehículos existentes en la base de datos.

Uso:
    python migrate_slugs.py
"""

import sqlite3
import json
import re

DB_NAME = "lions_cars.db"


def generar_slug(marca: str, modelo: str, ano: int, uid: str) -> str:
    base = f"{marca}-{modelo}-{ano}".lower()
    base = re.sub(r'[^a-z0-9-]', '-', base)
    base = re.sub(r'-+', '-', base).strip('-')
    return f"{base}-{uid}"


def main():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row

    # Agregar columna slug si no existe
    try:
        conn.execute("ALTER TABLE vehiculos ADD COLUMN slug TEXT")
        print("✓ Columna 'slug' creada")
    except sqlite3.OperationalError:
        print("✓ Columna 'slug' ya existe")

    rows = conn.execute("SELECT id, data, slug FROM vehiculos").fetchall()
    total = len(rows)
    generados = 0
    omitidos = 0

    print(f"\n📋 Total de vehículos: {total}\n")

    for row in rows:
        # Solo generar si no tiene slug todavía
        if row["slug"]:
            omitidos += 1
            continue

        try:
            data = json.loads(row["data"])
            marca = data.get("marca", "auto")
            modelo = data.get("modelo", "modelo")
            ano = data.get("ano", 0)

            slug = generar_slug(marca, modelo, ano, str(row["id"]))
            conn.execute("UPDATE vehiculos SET slug = ? WHERE id = ?", (slug, row["id"]))
            print(f"  ID {row['id']:>4} → {slug}")
            generados += 1

        except Exception as e:
            print(f"  ID {row['id']:>4} → ERROR: {e}")

    conn.commit()
    conn.close()

    print(f"\n{'='*50}")
    print(f"✅ Slugs generados:  {generados}")
    print(f"⏭  Ya tenían slug:   {omitidos}")
    print(f"📦 Total procesados: {total}")
    print(f"{'='*50}")


if __name__ == "__main__":
    print("🔧 Generando slugs para vehículos existentes...\n")
    main()