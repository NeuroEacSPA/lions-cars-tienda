import sqlite3
import json

DB_NAME = "lions_cars.db"

# Mapeo de correcciones de marcas
BRAND_CORRECTIONS = {
    "hyundai": "Hyundai",
    "Hyundai ": "Hyundai",
    "MAXUS": "Maxus",
    "kia": "Kia",
    "JAC ": "JAC",
    "Mitsubishi ": "Mitsubishi",
}

def fix_brands():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Obtener todos los vehículos
    c.execute("SELECT * FROM vehiculos")
    rows = c.fetchall()
    
    updated_count = 0
    
    for row in rows:
        car_data = json.loads(row["data"])
        original_marca = car_data.get("marca", "")
        
        # Si la marca necesita corrección
        if original_marca in BRAND_CORRECTIONS:
            car_data["marca"] = BRAND_CORRECTIONS[original_marca]
            
            # Actualizar en la base de datos
            c.execute("UPDATE vehiculos SET data = ? WHERE id = ?", 
                     (json.dumps(car_data), row["id"]))
            
            print(f"ID {row['id']}: '{original_marca}' -> '{car_data['marca']}'")
            updated_count += 1
    
    conn.commit()
    conn.close()
    
    print(f"\n✅ Total de vehículos actualizados: {updated_count}")

if __name__ == "__main__":
    print("🔧 Normalizando marcas en la base de datos...\n")
    fix_brands()
    print("\n✅ Proceso completado.")
