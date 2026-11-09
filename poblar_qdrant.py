"""
========================================================================================
POBLADO VECTORIAL DE QDRANT - PLATAFORMA INVENTRA
========================================================================================
Los datos inyectados en este script son DATOS SIMULADOS pero construidos estrictamente
en base al modelo de negocio, catálogo tecnológico corporativo y reglas de stock de Inventra:
- Códigos corporativos estandarizados (PROD-001 al PROD-008).
- Categorías reales: Computación, Monitores, Periféricos, Servidores, Redes y Almacenamiento.
- Reglas de 'Stock Crítico' operativas (cuando stock <= stock_minimo).
- Precios de mercado reales en USD, ubicaciones físicas de estantería y especificaciones técnicas.
- Vectorización real con NVIDIA Nemotron 3.5 Embed 1B (2048 dimensiones).
========================================================================================
"""

import sys
import json
import time
import urllib.request
import urllib.error

PRODUCTOS = [
    {
        "id": 1,
        "codigo": "PROD-001",
        "nombre": "Laptop Lenovo ThinkPad T14 Gen 4",
        "categoria": "Computación / Portátiles",
        "precio": 1250.00,
        "stock": 15,
        "stock_minimo": 5,
        "ubicacion": "Estante A-12",
        "descripcion": "Laptop corporativa Intel Core i7 13va Gen, 16GB RAM DDR5, 512GB SSD NVMe, pantalla 14 FHD IPS. Stock normal."
    },
    {
        "id": 2,
        "codigo": "PROD-002",
        "nombre": "Monitor Dell UltraSharp 27 4K UHD USB-C",
        "categoria": "Monitores y Pantallas",
        "precio": 480.00,
        "stock": 2,
        "stock_minimo": 5,
        "ubicacion": "Estante B-04",
        "descripcion": "Monitor profesional IPS 4K con 99% sRGB, USB-C 90W. ALERTA STOCK CRÍTICO: Solo 2 unidades disponibles (mínimo 5)."
    },
    {
        "id": 3,
        "codigo": "PROD-003",
        "nombre": "Teclado Mecánico Logitech MX Mechanical",
        "categoria": "Periféricos",
        "precio": 150.00,
        "stock": 28,
        "stock_minimo": 10,
        "ubicacion": "Estante C-01",
        "descripcion": "Teclado inalámbrico switches táctiles silenciosos, retroiluminación inteligente, Bluetooth y receptor Logi Bolt."
    },
    {
        "id": 4,
        "codigo": "PROD-004",
        "nombre": "Mouse Inalámbrico Logitech MX Master 3S",
        "categoria": "Periféricos",
        "precio": 110.00,
        "stock": 22,
        "stock_minimo": 8,
        "ubicacion": "Estante C-02",
        "descripcion": "Mouse ergonómico para productividad con sensor de 8000 DPI Darkfield, scroll MagSpeed y clics silenciosos."
    },
    {
        "id": 5,
        "codigo": "PROD-005",
        "nombre": "Servidor Rack Dell PowerEdge R650 1U",
        "categoria": "Servidores e Infraestructura",
        "precio": 4200.00,
        "stock": 2,
        "stock_minimo": 2,
        "ubicacion": "Zona Servidores S-01",
        "descripcion": "Servidor en rack 1U con 2 procesadores Intel Xeon Silver 4314, 64GB RAM ECC DDR4, 2x SSD 960GB SAS Enterprise."
    },
    {
        "id": 6,
        "codigo": "PROD-006",
        "nombre": "Switch Administrable Cisco Catalyst 24 Puertos PoE+",
        "categoria": "Redes y Telecomunicaciones",
        "precio": 890.00,
        "stock": 6,
        "stock_minimo": 3,
        "ubicacion": "Estante R-02",
        "descripcion": "Switch Gigabit Ethernet capa 2/3 con 24 puertos PoE+ (370W), 4 puertos SFP 1G y gestión remota Web y CLI."
    },
    {
        "id": 7,
        "codigo": "PROD-007",
        "nombre": "Disco Sólido SSD Samsung 990 PRO 2TB NVMe M.2",
        "categoria": "Almacenamiento",
        "precio": 195.00,
        "stock": 40,
        "stock_minimo": 15,
        "ubicacion": "Gaveta M-05",
        "descripcion": "Unidad SSD PCIe 4.0 NVMe con velocidades de lectura de 7450 MB/s y escritura de 6900 MB/s. Gran disponibilidad."
    },
    {
        "id": 8,
        "codigo": "PROD-008",
        "nombre": "Cámara Web Logitech Brio 4K Ultra HD",
        "categoria": "Periféricos y Videoconferencia",
        "precio": 180.00,
        "stock": 1,
        "stock_minimo": 4,
        "ubicacion": "Estante C-08",
        "descripcion": "Cámara web con resolución 4K HDR, reconocimiento Windows Hello, zoom 5x. ALERTA DE STOCK CRÍTICO: Solo 1 unidad restante."
    }
]

def generar_texto_rag(p):
    alerta = "ALERTA STOCK CRÍTICO" if p["stock"] <= p["stock_minimo"] else "Stock normal"
    return (
        f"PRODUCTO: {p['nombre']}\n"
        f"CÓDIGO: {p['codigo']}\n"
        f"CATEGORÍA: {p['categoria']}\n"
        f"PRECIO: ${p['precio']:.2f} USD\n"
        f"STOCK: {p['stock']} unidades (Mínimo: {p['stock_minimo']})\n"
        f"ESTADO: {alerta}\n"
        f"UBICACIÓN: {p['ubicacion']}\n"
        f"DESCRIPCIÓN: {p['descripcion']}"
    )

def obtener_embedding_individual(api_key, texto, retry=True):
    nvidia_payload = {
        "model": "nvidia/nemotron-3.5-embed-1b",
        "input": [texto],
        "input_type": "passage"
    }

    req = urllib.request.Request(
        "https://integrate.api.nvidia.com/v1/embeddings",
        data=json.dumps(nvidia_payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return data["data"][0]["embedding"]
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode()
        if retry:
            time.sleep(1.0)
            return obtener_embedding_individual(api_key, texto, retry=False)
        raise RuntimeError(f"HTTP {e.code}: {err_msg}")

def main():
    if len(sys.argv) < 2:
        print("Uso: python poblar_qdrant.py TU_NVIDIA_API_KEY")
        sys.exit(1)

    api_key = sys.argv[1].strip().strip('"').strip("'")
    qdrant_url = "http://localhost:6333"
    collection_name = "inventario_productos"

    print(f"[*] 1/3 - Verificando Qdrant local ({qdrant_url})...")
    try:
        req = urllib.request.Request(f"{qdrant_url}/collections/{collection_name}")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            print(f"[+] Qdrant listo. Colección '{collection_name}' (Puntos actuales: {data['result']['points_count']}).")
    except Exception as e:
        print(f"[-] No se pudo conectar con Qdrant: {e}")
        sys.exit(1)

    print(f"[*] 2/3 - Generando embeddings individuales con NVIDIA Nemotron 3.5 (1x1)...")
    points = []
    
    for idx, p in enumerate(PRODUCTOS):
        texto = generar_texto_rag(p)
        print(f"    -> Procesando producto {idx+1}/{len(PRODUCTOS)}: {p['nombre']}...", end="", flush=True)
        try:
            vector = obtener_embedding_individual(api_key, texto)
            # n8n busca 'content', mientras que otras librerías buscan 'pageContent' o 'text'
            # Al incluir todas las claves, garantizamos 100% de compatibilidad con n8n
            points.append({
                "id": p["id"],
                "vector": vector,
                "payload": {
                    "content": texto,
                    "pageContent": texto,
                    "text": texto,
                    "document": texto,
                    "metadata": {
                        "id": p["id"],
                        "codigo": p["codigo"],
                        "nombre": p["nombre"],
                        "categoria": p["categoria"],
                        "precio": p["precio"],
                        "stock": p["stock"],
                        "stock_minimo": p["stock_minimo"],
                        "ubicacion": p["ubicacion"]
                    },
                    "id": p["id"],
                    "codigo": p["codigo"],
                    "nombre": p["nombre"],
                    "categoria": p["categoria"],
                    "precio": p["precio"],
                    "stock": p["stock"],
                    "stock_minimo": p["stock_minimo"],
                    "ubicacion": p["ubicacion"]
                }
            })
            print(f" [OK: {len(vector)} dims]")
            time.sleep(0.15)
        except Exception as ex:
            print(f" [FALLÓ]")
            print(f"[-] Error en producto {p['codigo']}: {ex}")
            sys.exit(1)

    print(f"[*] 3/3 - Guardando los {len(points)} puntos en Qdrant...")
    upsert_payload = {"points": points}
    req_qdrant = urllib.request.Request(
        f"{qdrant_url}/collections/{collection_name}/points?wait=true",
        data=json.dumps(upsert_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="PUT"
    )

    try:
        with urllib.request.urlopen(req_qdrant, timeout=10) as resp:
            q_res = json.loads(resp.read().decode())
            print(f"[+] Qdrant respondió: {q_res.get('status')}")
    except Exception as e:
        print(f"[-] Error al guardar en Qdrant: {e}")
        sys.exit(1)

    print("\n" + "=" * 70)
    print("🎉 ¡ÉXITO TOTAL! LA BASE VECTORIAL QDRANT HA SIDO POBLADA")
    print(f"Total productos insertados: {len(points)}")
    print(f"Dimensiones de cada vector: {len(points[0]['vector'])} dims (NVIDIA Nemotron 3.5)")
    print("El RAG en tu frontend y n8n ya tiene la información lista para responder.")
    print("=" * 70)

if __name__ == "__main__":
    main()
