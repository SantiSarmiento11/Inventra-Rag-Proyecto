# Inventra - Sistema de Gestión de Inventario con Asistente RAG

Plataforma empresarial de control de inventario y analítica de stock con integración de Inteligencia Artificial para consultas semánticas mediante **RAG (Retrieval-Augmented Generation)**.

---

## 📹 Video Demostrativo

> 🔗 **Enlace al Video:** [Ver Video Demostrativo del Proyecto](https://drive.google.com/file/d/1EHTX7S86WusJ6a7dCL3E1Ry_Icb-64nQ/view?usp=sharing))  
> *(Reemplaza este enlace con la URL definitiva de tu video explicativo).*

---

## 🏗️ Arquitectura General

El sistema está compuesto por cuatro componentes desacoplados:

```
[ Frontend Web (SPA) ] ── (HTTP REST / JWT) ──> [ Backend Spring Boot ] ──> [ PostgreSQL ]
         │
         └── (POST /webhook/inventario-rag) ──> [ n8n (Agente RAG) ]
                                                       │
                                        ┌──────────────┴──────────────┐
                                        ▼                             ▼
                          [ NVIDIA Nemotron (2048 dims) ]    [ Qdrant Vector DB ]
                                        │                             │
                                        └───────────┬─────────────────┘
                                                    ▼
                                           [ DeepSeek LLM ]
```

1. **Frontend:** Single Page Application (SPA) construida en HTML5, CSS3 mate y JavaScript Vanilla. Incluye dashboard de métricas, catálogo de productos, gestión de usuarios/roles y chat con asistente RAG.
2. **Backend:** API REST en Spring Boot con Spring Security, autenticación por Tokens JWT y persistencia en PostgreSQL basada estrictamente en el Modelo Entidad-Relación (MER).
3. **Base de Datos Vectorial (Qdrant):** Motor de búsqueda vectorial corriendo en local (`http://localhost:6333`) que almacena las representaciones semánticas del inventario.
4. **Flujo Orquestador (n8n):** Recibe la pregunta del usuario desde la web, genera el embedding vectorial con **NVIDIA Nemotron 3.5**, busca en **Qdrant** y sintetiza la respuesta con **DeepSeek**.

---

## 🚀 Guía de Inicio Rápido

### 1. Requisitos Previos

* **Java 17+** y Gradle.
* **PostgreSQL** corriendo en el puerto `5432` con la base de datos `Inventra`.
* **Qdrant** corriendo en `http://localhost:6333` (vía Docker o binario local).
* **Python 3.10+** (para el script de poblado vectorial).
* **n8n** corriendo en `http://localhost:5678`.
* Una API Key gratuita de **NVIDIA** (obtenida en [build.nvidia.com](https://build.nvidia.com)).

---

## 🧠 Cómo Cargar los Datos en la Base Vectorial (Qdrant)

Una base de datos vectorial no contiene datos por defecto; necesita un proceso de **ingesta y vectorización**. Para ello, se incluye el script automatizado [`poblar_qdrant.py`](file:///c:/Users/Santiago%20Sarmiento/Desktop/RAG%20(Inventario)/poblar_qdrant.py).

### ¿Qué hace este script?

1. Toma un catálogo simulado y enriquecido de **8 productos corporativos** (ThinkPads, Servidores Rack Dell, Switches Cisco, Monitores 4K, SSDs NVMe) con sus especificaciones, ubicación en almacén, precios y estados de stock (incluyendo alertas de **Stock Crítico**).
2. Llama a la API oficial de NVIDIA con el modelo `nvidia/nemotron-3.5-embed-1b` para generar vectores reales de **2048 dimensiones**.
3. Envía los productos de forma individual (`1x1`) con pausas de 150 ms para garantizar estabilidad y evitar errores `500` por sobrecarga de lote en la nube de NVIDIA.
4. Almacena los puntos vectoriales en la colección `inventario_productos` de tu Qdrant local estructurados con las claves requeridas por n8n (`content`, `pageContent`, `text` y `metadata`).

### Instrucciones de Ejecución:

1. **Abre tu terminal** (PowerShell o CMD) en la carpeta raíz del proyecto:
   
   ```powershell
   cd "c:\Users\Santiago Sarmiento\Desktop\RAG (Inventario)"
   ```

2. **Ejecuta el script pasando tu clave de NVIDIA:**
   
   ```powershell
   python poblar_qdrant.py TU_NVIDIA_API_KEY
   ```
   
   *(Reemplaza `TU_NVIDIA_API_KEY` por tu clave que empieza con `nvapi-...`)*

3. **Salida esperada (tarda entre 3 y 5 segundos):**
   
   ```text
   [*] 1/3 - Verificando Qdrant local (http://localhost:6333)...
   [+] Qdrant listo. Colección 'inventario_productos' (Puntos actuales: 0).
   [*] 2/3 - Generando embeddings individuales con NVIDIA Nemotron 3.5 (1x1)...
       -> Procesando producto 1/8: Laptop Lenovo ThinkPad T14 Gen 4... [OK: 2048 dims]
       -> Procesando producto 2/8: Monitor Dell UltraSharp 27 4K UHD USB-C... [OK: 2048 dims]
       ...
   [*] 3/3 - Guardando los 8 puntos en Qdrant...
   [+] Qdrant respondió: completed
   ======================================================================
   🎉 ¡ÉXITO TOTAL! LA BASE VECTORIAL QDRANT HA SIDO POBLADA
   ======================================================================
   ```

4. **Verificación rápida:**  
   Puedes comprobar que la colección tiene los 8 puntos abriendo en tu navegador:  
   `http://localhost:6333/dashboard#/collections/inventario_productos` o consultando `http://localhost:6333/collections/inventario_productos`.

---

## ⚙️ Configuración del Flujo RAG en n8n

#### Workflow cargado en formato JSON en la raiz del proyecto como:

#### "workflow.json"




Para conectar el Frontend con Qdrant y DeepSeek:

1. **Nodos requeridos en n8n:**
   * **Webhook:** Método `POST`, ruta `inventario-rag`, modo `Respond to Webhook Node`.
   * **Agente RAG (`@n8n/n8n-nodes-langchain.agent`):** Texto de entrada `={{ $json.body.consulta }}`.
   * **Herramienta Vector Store (`@n8n/n8n-nodes-langchain.toolVectorStore`):** Conectada a la entrada `ai_tool` del Agente.
   * **Qdrant Vector Store:** Colección `inventario_productos`, conectada a la herramienta.
   * **NVIDIA Nemotron Embeddings:** Modelo `nvidia/nemotron-3.5-embed-1b`, conectado a Qdrant.
   * **DeepSeek Chat Model:** Modelo `deepseek-flash`, conectado al Agente y a la Herramienta.
   * **Responder al Webhook:** Formato JSON:
     
     ```json
     {
       "respuesta": "={{ $json.output }}",
       "fuente": "n8n RAG (DeepSeek + Qdrant + NVIDIA Nemotron)",
       "timestamp": "={{ $now.toISO() }}"
     }
     ```
2. **Activar el flujo:**  
   Pon el interruptor del workflow en **`Active`** (arriba a la derecha) para que quede escuchando en `http://localhost:5678/webhook/inventario-rag`.

---

## 💻 Ejecución de la Aplicación

### Iniciar el Backend (Spring Boot):

```powershell
cd backend
./gradlew bootRun
```

*El backend iniciará en `http://localhost:8080`.*

### Iniciar el Frontend:

Sirve la carpeta `frontend/` mediante cualquier servidor estático local (por ejemplo, con la extensión **Live Server** de VS Code o ejecutando `npx serve frontend -p 5500`):
*Abre tu navegador en `http://localhost:5500`.*

---

## 📄 Documentación Adicional

* Para consultar los endpoints REST y la estructura de datos del cliente web, revisa: [`frontend/API_DOCUMENTATION.md`](file:///c:/Users/Santiago%20Sarmiento/Desktop/RAG%20(Inventario)/frontend/API_DOCUMENTATION.md).
