# AUDITORÍA DE RUTAS - COMPLEJO PLAYA PARAÍSO
Fecha: 2026-10-15

## 1. POIs Verificados con coordenadas (50)
Verificados según `inventory_final.json`. Sin coordenadas verificadas: Pendiente ubicación (1), Pendiente coordenadas (40), No verificable (9).

## 2. Inspección del motor
- `mapas.isComplexDestination`: usa `complexRoutingBounds` (state.complexBounds + POIs verificados); true → perfil `pedestrian`.
- `mapas.computeRoute`: prefer `pedestrian` → `requestPedestrianRoute`; fallback a `driving` si falla (excepto abort).
- `mapas.openDirections`: limpia ruta previa (`state.routeLine.remove()`), centra destino, muestra estado con distancia/duración/proveedor.
- `guia-playa-paraiso.routeToPoi`: requiere `canMap(poi)` y posición; cancela previa (`cancelRoute(true)`), usa `AbortController`, `drawRoute` centra vista, actualiza estado.
- `routes.portalMapActions` + `.portal-directions`: permite calcular ruta al destino/hotel más cercano.

## 3. Verificación Coco Bar (corrección solicitada)
**Registro actual (`id: "cocobar"`):**
- Cat: bar | Nombre: Coco Bar
- Estado: Pendiente de ubicación (verified=false, coords presentes: 20.7631,-86.9618)
- external: false | kind: null
- Fuentes: plano (source: "plano"); coordenadas no verificadas con OSM. OSM bbox complejo/ampliado no contiene "Coco Bar". Plano oficial menciona "COCO BAR".
- Punto-in-polygon: fuera del perímetro OSM oficial (way 138147423), dentro de Vidanta (way 289799188).

**Acción realizada:** No se modificaron coordenadas. Se mantuvo `verified:false`, `external:false`, `source:"plano"`. **Conclusión:** No existe evidencia suficiente para confirmar ubicación exacta dentro del complejo. No se inventan coordenadas. El marcador permanece con ubicación pendiente (no se muestra como verificado; no se dibuja como POI verificable).

## 4. Comportamiento estructural (validado)
- Cambio de destino: cancelación previa + nuevo cálculo.
- Cancelar ruta: AbortController.abort + removeRouteLine.
- Sin posición: solicita ubicación; sin coords: mensaje de error; área (kind=area): no calcula ruta.
- Perfil: pedestrian si destino dentro de límites del complejo.

## 5. Pruebas existentes
- `cdp-nav.mjs`: 20/20 PASS
- `cdp-test.mjs`: 35/35 PASS
- `cdp-listings.mjs`: 18/18 PASS
**Total:** 73/73 PASS

## 6. Estado de verificación de rutas
- **Cálculo estructural (lógica del motor):** VERIFICADO
- **Transitabilidad física real (recorridos en terreno/proveedor):** NO VERIFICADA (no se ejecutaron peticiones externas a Valhalla/OSRM en este entorno de auditoría)
- **Evidencia empírica de dibujo/flujo UI:** VERIFICADO estructuralmente

## 7. Conclusión
No se detectaron errores de código demostrados. Leaflet/OSM conservados. **Coco Bar permanece como "Pendiente de ubicación"** por falta de evidencia suficiente para corregir sus coordenadas; no se ha inventado ninguna coordenada. No se declararon rutas como transitables físicamente.
