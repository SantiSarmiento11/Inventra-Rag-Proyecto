# Inventra RAG - Plataforma de Gestion de Inventarios con Recuperacion Aumentada por Generacion

Sistema empresarial de control de inventarios, gestion de almacenes y busqueda semantica inteligente asistida por modelos de lenguaje y bases de datos vectoriales.

[![Dominio](https://img.shields.io/badge/Dominio-Sistemas%20RAG%20%26%20Inventarios-0052CC.svg)]()
[![Java](https://img.shields.io/badge/Java-25-orange.svg)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.2-brightgreen.svg)]()
[![Qdrant](https://img.shields.io/badge/Vector%20DB-Qdrant-red.svg)]()
[![n8n](https://img.shields.io/badge/Orquestacion-n8n-EA4B71.svg)]()

## Resumen Ejecutivo

La administracion de almacenes e inventarios a gran escala enfrenta comunmente desafios asociados a la dispersión de datos tecnicos, discrepancias en nomenclaturas y lentitud en la identificacion de articulos similares o equivalentes. Inventra RAG transforma la experiencia operativa integrando una arquitectura de backend robusta en Spring Boot con una base de datos vectorial Qdrant y flujos de automatizacion en n8n, permitiendo consultas en lenguaje natural mediante tecnicas RAG (Retrieval-Augmented Generation).

## Alcance y Objetivos de Negocio

- Control transaccional de existencias, categorias, almacenes y movimientos fisicos de mercancia.
- Busqueda semantica y recuperacion contextual de productos a partir de consultas ambiguas o descripciones funcionales.
- Seguridad perimetral con autenticacion basada en JSON Web Tokens (JWT) y control de acceso basado en roles (RBAC).
- Orquestacion de flujos de notificacion automatica ante caidas en puntos de reorden y pedidos de abastecimiento.
- Interoperabilidad completa a traves de una API REST documentada bajo el estandar OpenAPI 3.

## Arquitectura del Sistema

Inventra RAG sigue un enfoque arquitectonico desacoplado y orientado a servicios:
1. Nucleo Backend (Spring Boot 4.1, Spring Data JPA, Spring Security).
2. Capa de Base de Datos Relacional y Vectorial (MySQL / PostgreSQL para persistencia transaccional y Qdrant para indices vectoriales).
3. Capa de Orquestacion RAG (n8n para automatizacion de pipelines y poblamiento de embeddings).
4. Capa Frontend Administrativa (Cliente web para operadores y jefes de inventario).

### Diagrama de Flujo Arquitectonico

```mermaid
flowchart TD
    A[Cliente Web / Operador] -->|HTTP / JSON Web Token| B[Spring Boot Gateway / Controllers]
    B --> C[Spring Security / Filtros JWT]
    C --> D[Capa de Servicios de Negocio]
    D -->|JPA / Hibernate| E[(Base de Datos Relacional)]
    D -->|HTTP REST Client| F[(Qdrant Vector Database)]
    G[Pipeline n8n Automation] -->|Webhook / API| B
    H[Script de Vectorizacion poblar_qdrant.py] -->|Embeddings| F
    D -->|Contexto Enriquecido| I[Motor RAG / Generacion de Respuesta]
```

### Estructura de Directorios

```text
Inventra-Rag-Proyecto/
├── .env.example             # Plantilla de configuracion de variables de entorno
├── .gitignore               # Reglas de exclusion de control de versiones
├── poblar_qdrant.py         # Script utilitario de generacion e indexacion de embeddings
├── workflow.json            # Definicion exportable del flujo de orquestacion n8n
├── backend/                 # Modulo de servicios y logica empresarial en Java
│   ├── build.gradle         # Gestion de dependencias y plugins de Gradle
│   ├── gradlew              # Wrapper de ejecucion Gradle para entornos Unix
│   ├── gradlew.bat          # Wrapper de ejecucion Gradle para Windows
│   └── src/main/java/...    # Controladores, servicios, modelos y seguridad Spring Boot
└── frontend/                # Interfaces graficas y componentes de administracion
```

## Stack Tecnologico

El sistema combina una infraestructura de persistencia mixta y una logica transaccional tipada y confiable.

### Backend y Persistencia

- ![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white) Entorno de ejecucion backend con Java 25.
- ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white) Framework empresarial para microservicios y APIs REST.
- ![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white) Marco de seguridad, autorizacion y proteccion de recursos.
- ![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white) Sistema de construccion y gestion declarativa de dependencias.
- ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) Mecanismo de sesiones sin estado e intercambio seguro de identidades.
- ![Qdrant](https://img.shields.io/badge/Qdrant-DC2626?style=for-the-badge&logo=qdrant&logoColor=white) Motor vectorial para almacenamiento de embeddings y busqueda por similitud de coseno.

### Frontend y Automatizacion

- ![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white) Motor de orquestacion de flujos y pipelines de datos asincronos.
- ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) Scripts de soporte para procesamiento matricial y preparacion de colecciones vectoriales.
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) Dinamismo del panel administrativo del cliente web.
- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) Formatos estandar de interfaz para gestion de existencias.
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) Estilos y diseno responsivo para terminales moviles y de escritorio.
