# Informe Final: Auditoría de coordenadas y rutas de /complejo-playa-paraiso

## 1. Objetivo
Auditar de forma sistemática las coordenadas y rutas asociadas al complejo **Iberostar Playa Paraíso** en la Revista Digital Iberostar THE CLUB, siguiendo el orden obligatorio: inspeccionar → inventariar → verificar fuentes → corregir errores confirmados → probar → informar. El objetivo es validar el estado de cada POI (Verificado / Pendiente de coordenadas / Pendiente de ubicación / Pendiente de ruta / Error confirmado / No verificable) sin inventar coordenadas.

## 2. Metodología
- **Inspección inicial:** Lectura exhaustiva de `js/guia-playa-paraiso.js` (804 líneas, codificación latin-1) para extraer el catálogo `POIS` y `CATEGORIES`, el mecanismo de `_route`, el explorador y la lógica de verificación.
- **Recorrido de código relacionado:** Revisión de `js/routes.js` (renderPortal `/complejo-playa-paraiso`, `initComplexPortalMap`, `portalMapActions`, `portalComplexViewBounds`, `portalHotelPoints`), `js/mapas.js` (rutas peatonales/vehiculares, `isComplexDestination`, `computeRoute`, `complexRoutingBounds`), `function.js` (perímetro/bounds del complejo, `setupComplexMapFraming`), `js/hoteles.js`, `js/restaurantes.js` para confirmar consistencia de rutas/navegación.
- **Inventario automático:** Extracción programática de todos los POIs (con y sin coordenadas) para clasificar estados según la definición dada.
- **Verificación contra fuentes oficiales:** Extracción del plano oficial (PDF) `https://hotels1.cdn.iberostar.com/uploads/document/document/2142/document.pdf` (769291 bytes, procesado para extraer texto) y consulta de OpenStreetMap: descarga del mapa completo del bbox del complejo y del polígono OSM `way 138147423` (perímetro oficial del resort), incluyendo el polígono de `Vidanta Riviera Maya` para el análisis de conflictos.
- **Cruce OSM<->catálogo:** Comparación de cada POI con `source:"osm"` frente a features OSM con nombre en el bbox, calculando distancia geodésica (m) y coincidencia semántica del nombre.
- **Test de inclusión de polígono:** Point-in-polygon para verificar pertenencia al polígono oficial OSM del complejo y al polígono de Vidanta.
- **Pruebas funcionales:** Ejecución de suites existentes `cdp-nav.mjs`, `cdp-test.mjs`, `cdp-listings.mjs` (20/35/18 tests respectivamente) en entorno Live Server `http://127.0.0.1:5500`.

## 3. Fuentes
- **Plano oficial (PDF):** `https://hotels1.cdn.iberostar.com/uploads/document/document/2142/document.pdf` — utilizado para validar existencia/nomenclatura de instalaciones del complejo (ej. Coco Bar, bares/restaurantes, servicios). Texto extraído (244 líneas de etiquetas relevantes) para verificación cruzada.
- **OpenStreetMap (OSM):** `way/138147423` ("Iberostar Playa Paraiso Resort") — define perímetro oficial utilizado en el código (`complexPerimeter`/`complexBounds`). Bbox completo del complejo descargado (`map?bbox=-86.9700,20.7530,-86.9570,20.7650`, 1.59MB) y análisis de features nombrados. También `way/289799188` ("Vidanta Riviera Maya") para análisis de conflicto de ubicación.
- **Fuentes internas del proyecto:** `js/guia-playa-paraiso.js`, `js/routes.js`, `js/mapas.js`, `function.js`, `js/hoteles.js` (coordenadas oficiales de hoteles).
- **Verificación de rutas deep-link:** stubs `complejo-playa-paraiso/index.html` y `guia-playa-paraiso/index.html` con `../js/route-entry.js`.

## 4. Inventario de puntos (estado por punto)
Catálogo total: **100 POIs** (tras auditoría).

### Distribución por estado
- **Verificados (Verificado): 50** — POIs con `verified === true` y coordenadas, presentes en mapa/explorador (incluye área "Mar Caribe" con `kind:"area"`).
- **Pendiente de ubicación: 1** — POI con coordenadas pero `verified === false` (`cocobar`, tras corrección).
- **Pendiente de coordenadas: 49** — POIs con `verified === false` y **sin** coordenadas (`lat/lng` ausentes).
- **Pendiente de ruta / Error confirmado / No verificable:** 0 (ninguno clasificado como tales tras corrección).

### Detalle por categorías (resumen)
- **Hoteles (5):** Todos Verificados (coordenadas `source:"official"`, alineadas con `hotelCoordinates` en `function.js`).
- **Golf/Convenciones/Spa/Kids/Discoteca (6):** Verificados (`source:"osm"`), con pequeños desajustes de centro de way (<10m) aceptables.
- **Playas/Áreas (2):** "Mar Caribe" (área/etiqueta, Verificado), "THE CLUB" (Pendiente de coordenadas).
- **Restaurantes (27 totales en inventario):** 21 Verificados (`source:"osm"`) + 6 Pendiente de coordenadas (`beach-grill`, `el-fogon-steak`, `el-fogon-italiano`, `coco-buffet`, `latelier`, `baby-kitchen`).
- **Bares (15):** 6 Verificados + 9 Pendiente de coordenadas.
- **Piscinas (9):** 3 Verificados (`sports-pool`, `wave-pool`, `lazy-river`) + 6 Pendiente de coordenadas.
- **Spa (1 extra):** `massage-palapa` Pendiente de coordenadas (además de `spa` Verificado).
- **Deportes/Entretenimiento/Compras/Servicios/Kids (restantes):** mayoritariamente Pendiente de coordenadas (coherente con POIs marcados `source:"plano", verified:false` en el catálogo original).

### Cruce OSM (POIs `source:"osm"`)
De los 45 POIs con `source:"osm"` originalmente:
- **44** se ubican a ≤ ~36m de un feature OSM con nombre coincidente o semánticamente equivalente (coordenadas verificables).
- **1** (`cocobar`) se ubica a **154m** del feature OSM más cercano y **no existe** ningún feature OSM denominado "Coco Bar" en el bbox complejo ni en un bbox ampliado (-86.970..-86.940). Además su coordenada (20.7631,-86.9618) cae **dentro del polígono de Vidanta Riviera Maya** (way 289799188) y **fuera del polígono oficial del complejo** (way 138147423) — confirmado por point-in-polygon.

## 5. Errores confirmados
Únicamente **1 error confirmado** identificado:

**`cocobar` (id: "cocobar", name: "Coco Bar", categoría bar)**
- Estado original: `verified:true`, `source:"osm"`, `external:true`, coordenadas `20.7631,-86.9618`.
- **Hallazgos:**
  1. No existe feature OSM con nombre "Coco Bar" en el área del complejo ni en el entorno de Vidanta (verificación OSM exhaustiva). Por tanto, la afirmación `source:"osm"` **no es verificable** (falsa).
  2. La coordenada está **fuera del polígono oficial OSM del complejo Iberostar Playa Paraíso** (way 138147423) y **dentro del polígono OSM de Vidanta Riviera Maya** (way 289799188).
  3. El plano oficial de Iberostar Playa Paraíso incluye un "COCO BAR / BEACH BAR", lo que genera un **conflicto entre plano oficial y la ubicación/atribución** registrada en el código.
- **Clasificación:** **Error confirmado** (procedencia OSM no verificable + conflicto de atribución/origen). No se trata de un error de valor numérico aislado, sino de **afirmación de verificación/procedencia falsa**.

No se detectaron errores de coordenadas numéricas en otros POIs con `source:"osm"` (las pequeñas discrepancias <50m corresponden a centros de way vs. nodos OSM, naming alternativo o precisión de digitalización, todas dentro de márgenes razonables y no constituyen errores).

## 6. Correcciones aplicadas
**Corrección mínima y defensiva (única):**

```diff
-    {"id":"cocobar","name":"Coco Bar","category":"bar","lat":20.7631,"lng":-86.9618,
-     "description":"Resort vecino Vidanta Riviera Maya (fuera del complejo)","source":"osm","verified":true,"external":true},
+    {"id":"cocobar","name":"Coco Bar","category":"bar","lat":20.7631,"lng":-86.9618,
+     "description":"Coco Bar","source":"plano","verified":false},
```

**Justificación:**
- Se elimina la afirmación falsa `source:"osm"` y `verified:true`, sustituyéndola por `source:"plano"` y `verified:false` (alineado con el resto de elementos pendientes del plano).
- Se elimina `external:true` para que el elemento **aparezca en el explorador de la guía** como **Pendiente de verificación/ubicación** (honesto respecto al conflicto plano vs ubicación), sin forzar su visualización en el mapa (al tener `verified:false`, no cumple `canMap()` y no se renderiza como POI verificable). Esto preserva la información existente (coordenadas) sin inventar nada y evita ocultar o afirmar falsamente su estado.
- Tras la corrección, el estado pasa de "Verificado" a **"Pendiente de ubicación"** (tiene coordenadas pero no verificadas) — clasificación correcta según la definición establecida.

**No se realizaron otras correcciones.** No se añadieron POIs (omisiones detectadas como "Towel Hut", "Bar El Puente" u otros nombres presentes en OSM/plano no se consideran errores confirmados en datos existentes; se documentan a efectos informativos). No se modificaron coordenadas numéricas.

## 7. Verificación y pruebas
### Validación estática del código
- `node --check` implícito: la modificación de `guia-playa-paraiso.js` se evaluó mediante `new Function()` sin errores de sintaxis.
- Verificación de que no queda `external:true` asociado a `cocobar` tras el cambio.
- Regeneración del inventario automático: estado de `cocobar` confirmado como **Pendiente de ubicación**; distribución global coherente.

### Pruebas funcionales (Chrome CDP, Live Server puerto 5500)
| Suite | Tests | Resultado | Observaciones |
|---|------|-----------|---------------|
| `cdp-nav.mjs` (Navegación global/back) | 20 | **20/20 PASS** | Incluye `/complejo-playa-paraiso` (href=/, texto "Volver a destinos", trail correcto), SPA sin bucles, responsive 390px. |
| `cdp-test.mjs` (Fichas hotel/360/restaurantes) | 35 | **35/35 PASS** | Selector migrado `.restaurant-back`→`.portal-nav-back` verificado; conservación de fichas 360 y botones correctos. |
| `cdp-listings.mjs` (Listados restaurantes + accesos directos) | 18 | **18/18 PASS** | Accesos directos `/restaurantes`, Brasil/RD/Jamaica, navegación/recarga OK. |

**Resultado global de pruebas:** **73/73 PASS**, 0 FAIL. Sin errores de consola detectados.

### Verificación de integridad del mapa del complejo
- Perímetro oficial OSM (way 138147423) coincide exactamente con `complexPerimeter`/`complexBounds` en `function.js` (bbox verificado).
- `routes.js initComplexPortalMap` utiliza `portalHotelPoints` + POIs verificados para el encuadre; la corrección de `cocobar` no afecta el encuadre (dejó de ser verificado/externo con impacto mínimo, y el resto de POIs del complejo permanecen inalterados).
- Motor de rutas (`mapas.js`): `isComplexDestination` usa `complexRoutingBounds` (amplía bounds con POIs verificados) — cambio no altera comportamiento de rutas.

## 8. Conclusiones
- **Estado general:** El inventario de coordenadas del complejo Playa Paraíso está **muy sólido**. La gran mayoría de los POIs con origen OSM están correctamente verificados y mapean a features OSM reales.
- **Errores encontrados:** **1 error confirmado** (`cocobar`) relacionado con **procedencia/falsa verificación OSM** y **conflicto de clasificación** (externo vs. pertenencia al complejo según plano oficial). No se detectaron errores numéricos de coordenadas.
- **Correcciones:** Aplicada **única corrección mínima y defensiva** que elimina afirmaciones falsas de verificación/procedencia, clasifica el punto de forma honesta (**Pendiente de ubicación**) y lo hace visible en el explorador sin inventar coordenadas ni romper comportamiento existente.
- **Rutas/navegación:** `/complejo-playa-paraiso` mantiene navegación correcta (nav global Tarea 1), deep-link stub funcional, y el motor de rutas peatonales/vehiculares sigue operando con los criterios existentes.
- **Pruebas:** **73/73 tests existentes PASS** tras la corrección. No se introdujeron regresiones.
- **Recomendación (informativa):** Las omisiones detectadas (p.ej. "Towel Hut" en OSM, "Bar El Puente" vs heladería) podrían añadirse en el futuro **solo si se desea**, pero no constituyen errores confirmados y su inclusión requeriría validación adicional contra plano oficial; conforme a las restricciones del encargo ("no crear segunda base de datos ni duplicar catálogo"), no se han incorporado.
- **Conclusión final:** La auditoría cumple el orden requerido, identifica y corrige el único error confirmado, verifica fuentes (PDF oficial + OSM), clasifica todos los POIs según estados definidos y valida con pruebas existentes sin inventar datos.

---
**Archivo generado:** `AUDITORIA_COORDENADAS_COMPLEJO_PLAYA_PARADISO.md`  
**Fecha:** 2026-10-15  
**Proyecto:** Revista Digital Iberostar THE CLUB (`C:\Users\cmstcm.practicante\Downloads\Revista Digital`, rama `main`)  
