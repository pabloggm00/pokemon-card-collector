# 🎴 Pokemon Card Collector

Una aplicación web completa para coleccionar y gestionar cartas Pokémon del TCG (Trading Card Game). Permite crear colecciones, importar sets completos, y llevar un seguimiento detallado de tus cartas.

Ha sido desarrollada para uso personal, pero cualquier persona puede utilizarla, adaptarla o mejorarla libremente.
Ten en cuenta que al estar pensada para un uso doméstico puede presentar pequeños fallos relacionados con la API externa o carecer de algunos detalles muy específicos del TCG.
Aun así, es totalmente funcional para gestionar colecciones de forma sencilla.

![Pokemon Card Collector](https://img.shields.io/badge/Estado-Funcional-brightgreen) ![Docker](https://img.shields.io/badge/Docker-Compatible-blue) ![License](https://img.shields.io/badge/Licencia-MIT-yellow)

<img width="800" alt="Captura de pantalla sets" src="https://github.com/user-attachments/assets/110f6bd2-5926-4a24-8ecc-7b2bdc42f9d7" />

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
- [Uso de la Aplicación](#-uso-de-la-aplicación)
- [Configuración Avanzada](#️-configuración-avanzada)
- [API Externa y Dependencias de Internet](#-api-externa-y-dependencias-de-internet)
- [Solución de Problemas](#-solución-de-problemas)

---

## ✨ Características

- **Gestión de Colecciones**: Crea colecciones por sets completos o personalizadas
- **Importación de Sets**: Importa sets completos directamente desde la API de TCGdex
- **Filtros Avanzados**: Filtra por tipo de carta, rareza, tipo de Pokémon, y estado de posesión
- **Estadísticas**: Porcentaje de completado por colección
- **Modo Selección**: Elimina múltiples series o colecciones a la vez
- **Responsive Design**: Completamente adaptado para móviles y tablets
- **Interfaz Intuitiva**: Diseño limpio y fácil de usar

---

## 🛠️ Tecnologías

### Frontend
- **Angular 20** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Nginx** - Servidor web (en Docker)

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Prisma ORM** - Gestión de base de datos
- **@tcgdex/sdk** - SDK oficial de TCGdex para datos de cartas

### Base de Datos
- **PostgreSQL 16** - Base de datos relacional

### DevOps
- **Docker & Docker Compose** - Containerización
- **Multi-stage builds** - Optimización de imágenes

---

## 🏗 Arquitectura

Aplicación web con arquitectura de 3 capas:
- **Frontend** (Angular + Nginx) en puerto **8081**
- **Backend API** (Node.js + Express) en puerto **3001**
- **Base de Datos** (PostgreSQL) en puerto **5432**

Todo orquestado con Docker Compose. Las imágenes de las cartas se obtienen de TCGdex API externa.

**Flujo de Datos:**
1. El usuario accede al frontend en `http://localhost:8081`
2. Las peticiones a `/api/*` son redirigidas por Nginx al backend
3. El backend consulta la base de datos PostgreSQL
4. Para importar sets, el backend usa el SDK de TCGdex (requiere internet)
5. Las imágenes de las cartas se cargan desde URLs externas de TCGdex

---

## 📦 Requisitos Previos

- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **Conexión a Internet** 
- **Puertos disponibles**: 
  - **8081** (frontend)
  - **3001** (backend API)
  - **5432** (PostgreSQL - para conectarte con pgAdmin, DBeaver, etc.)

> **Nota**: No necesitas instalar Node.js, npm, PostgreSQL ni ninguna otra dependencia. Todo se ejecuta dentro de contenedores Docker.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el Repositorio

```bash
git clone https://github.com/pabloggm00/pokemon-card-collector.git
cd pokemon-card-collector/pokemon-collector-app
```

### 2. Iniciar la Aplicación

```bash
docker-compose up -d
```

Este comando:
- Descargará las imágenes base necesarias (PostgreSQL, Node, Nginx)
- Construirá las imágenes del backend y frontend
- Creará los contenedores y la red Docker
- Iniciará todos los servicios en segundo plano

**Tiempo estimado**: 2-5 minutos en la primera ejecución.

### 3. Verificar que todo funciona

```bash
docker-compose ps
```

Deberías ver 3 contenedores corriendo:
- `pokemon-collector-db` (PostgreSQL)
- `pokemon-collector-backend` (API)
- `pokemon-collector-frontend` (Nginx + Angular)

### 4. Acceder a la Aplicación

Abre tu navegador y ve a: **http://localhost:8081**

---

## 📖 Uso de la Aplicación

### Primer Uso

1. **Importar un Set**:
   - Navega a "Importar Sets"
   - Selecciona una serie (ej: Sword & Shield)
   - Elige un set (ej: Base Set)
   - Haz clic en "Importar Set"
   - Se creará automáticamente una colección con todas las cartas

2. **Gestionar tu Colección**:
   - Ve a "Colecciones"
   - Haz clic en la colección que acabas de crear
   - Marca las cartas que posees con el botón añadir
   - Gestiona las cartas con sus variantes (Normal, Reverse, Holo, etc.)

3. **Crear Colección Personalizada**:
   - Ve a "Colecciones"
   - Haz clic en "Crear Colección"
   - Selecciona "Colección Personalizada"
   - Añade las cartas que desees desde diferentes sets

---

## ⚙️ Configuración Avanzada

### Acceder a la Base de Datos con pgAdmin o DBeaver

La base de datos PostgreSQL está **expuesta en el puerto 5432** para que puedas conectarte con herramientas como pgAdmin, DBeaver o TablePlus.

**Datos de conexión**:
- Host: `localhost`
- Puerto: `5432`
- Usuario: `pokemon_user`
- Password: `pokemon_password`
- Database: `pokemon_collector`

### Acceder a Prisma Studio

Para gestionar la base de datos con una interfaz visual dentro del contenedor:

```bash
# Ejecutar Prisma Studio en el contenedor del backend
docker exec -it pokemon-collector-backend npx prisma studio --hostname 0.0.0.0

# Acceder en el navegador
# http://localhost:5555
```

> **Nota**: Necesitas exponer el puerto 5555 en el `docker-compose.yml` si quieres acceder desde el navegador.

### Cambiar el Puerto del Frontend

Por defecto el frontend corre en el puerto **8081**. Para cambiarlo:

```yaml
# En docker-compose.yml, servicio 'frontend'
frontend:
  ports:
    - "3000:80"  # Cambia 8081 por el puerto que prefieras
```

Luego reinicia: `docker-compose up -d frontend`

---

## 🌐 API Externa y Dependencias de Internet

### TCGdex API

La aplicación utiliza el **SDK oficial de TCGdex** (`@tcgdex/sdk`) para obtener información de cartas Pokémon.

> **Nota**: Pueden aparecer cartas sin alguna propiedad (foto, rareza, etc.).

**Ubicación en el código**: 
- `backend/controllers/import.controller.js` - Controlador que usa el SDK directamente

**Funcionalidades que requieren internet**:
- ✅ Importar nuevos sets de cartas
- ✅ Obtener información actualizada de sets y series

**Funcionalidades que NO requieren internet** (una vez importados los datos):
- ❌ Visualizar colecciones existentes
- ❌ Marcar cartas como poseídas
- ❌ Filtrar y buscar cartas
- ❌ Gestionar colecciones personalizadas

### Imágenes de Cartas

Las imágenes de las cartas **se cargan desde URLs externas** proporcionadas por TCGdex:

**Formato de URLs**: 
- `https://assets.tcgdex.net/[lang]/[set-id]/[card-number]`
- Ejemplo: `https://assets.tcgdex.net/es/swsh1/1`

**Variantes de imágenes**:
- `high.webp` - Alta resolución (usado en vista previa)
- `low.webp` - Baja resolución (usado en listas)

> **Importante**: Las imágenes **NO se almacenan localmente**. Se requiere conexión a internet cada vez que se visualizan las cartas. Esto mantiene la aplicación ligera y siempre actualizada con las últimas imágenes.

### Funcionamiento Offline

Una vez importados los sets:
- ✅ Los **metadatos** de las cartas (nombre, número, rareza, tipo) se almacenan en PostgreSQL
- ✅ La aplicación funciona sin internet para gestión de colecciones
- ❌ Las **imágenes** no se cargarán sin conexión (aparecerá imagen por defecto)

---

## 🔧 Solución de Problemas

### Las imágenes de las cartas no cargan

**Causa**: No hay conexión a internet o TCGdex está caído.

**Solución temporal**:
- Verifica tu conexión a internet
- Las funcionalidades de gestión seguirán funcionando, solo las imágenes e importar sets fallarán.

### Error al importar sets: "Failed to fetch"

**Causa**: Problema de conexión con TCGdex API o AdBlocker bloqueando la petición.

**Soluciones**:
1. Desactiva temporalmente tu AdBlocker
2. Verifica conexión a internet
3. Espera unos minutos y vuelve a intentar (puede ser throttling de la API)


### Ver logs de errores

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Seguir logs en tiempo real
docker-compose logs -f backend
```

---

## 📝 Comandos Útiles

```bash
# Iniciar la aplicación
docker-compose up -d

# Detener la aplicación (conserva los datos)
docker-compose down

# Detener y BORRAR TODOS LOS DATOS
docker-compose down -v

# Ver estado de los contenedores
docker-compose ps

# Ver logs
docker-compose logs -f

# Reconstruir las imágenes (después de cambios en código)
docker-compose up -d --build

# Acceder al contenedor del backend
docker exec -it pokemon-collector-backend sh

# Acceder a la base de datos
docker exec -it pokemon-collector-db psql -U pokemon_user -d pokemon_collector
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- **TCGdex** - Por proporcionar la API y SDK gratuitos para datos de cartas Pokémon.

---

## 📧 Contacto

**Pablo González** - [Portfolio](https://pabloggm00.github.io/Portfolio/)

**Link del Proyecto**: [https://github.com/pabloggm00/pokemon-card-collector](https://github.com/pabloggm00/pokemon-card-collector)

---

## ⭐ ¿Te gusta el proyecto?

Si te ha resultado útil, ¡dale una estrella en GitHub! ⭐

---

**Hecho con ❤️ para coleccionistas de cartas Pokémon**
