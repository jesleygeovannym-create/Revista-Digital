# Imágenes de portada de hoteles

Portadas descargadas del CDN oficial de imágenes de Iberostar el 6 de octubre de 2026. Los identificadores de la URL corresponden a las imágenes principales enlazadas desde las páginas oficiales de cada hotel.

| Archivo | Hotel | Recurso de origen |
| --- | --- | --- |
| `joia-rose-hall.jpg` | JOIA Rose Hall by Iberostar | https://apiimg.iberostar.com/uploads/image/89477/crops/16%3A9/1920/image.jpeg |
| `selection-rose-hall-suites.jpg` | Iberostar Selection Rose Hall Suites | https://apiimg.iberostar.com/uploads/image/85068/crops/16%3A9/1920/image.jpg |
| `waves-rose-hall-beach.jpg` | Iberostar Waves Rose Hall Beach | https://apiimg.iberostar.com/uploads/image/62628/crops/16%3A9/1920/image.jpeg |
| `selection-bavaro-suites.jpg` | Iberostar Selection Bávaro Suites | https://apiimg.iberostar.com/uploads/image/56218/crops/16%3A9/1920/image.jpeg |
| `joia-bavaro.jpg` | JOIA Bávaro by Iberostar | https://apiimg.iberostar.com/uploads/image/81279/crops/16%3A9/1920/image.jpeg |
| `waves-punta-cana.jpg` | Iberostar Waves Punta Cana | https://apiimg.iberostar.com/uploads/image/71724/crops/16%3A9/1920/image.jpeg |
| `waves-dominicana.jpg` | Iberostar Waves Dominicana | https://apiimg.iberostar.com/uploads/image/78483/crops/16%3A9/1920/image.jpeg |
| `selection-praia-do-forte.jpg` | Iberostar Selection Praia do Forte | https://apiimg.iberostar.com/uploads/image/44262/crops/16%3A9/1920/image.jpeg |
| `waves-bahia.jpg` | Iberostar Waves Bahia | https://apiimg.iberostar.com/uploads/image/67367/crops/16%3A9/1920/image.jpeg |
| `grand-amazon-expedition.jpg` | Grand Amazon Expedition | https://apiimg.iberostar.com/uploads/image/28709/crops/16%3A9/1920/image.jpeg |
| `selection-cancun.jpg` | Iberostar Selection Cancún | https://apiimg.iberostar.com/uploads/image/80497/crops/16%3A9/1920/image.jpeg |
| `waves-cozumel.jpg` | Iberostar Waves Cozumel | https://apiimg.iberostar.com/uploads/image/84210/crops/16%3A9/1920/image.jpg |
| `selection-playa-mita.jpg` | Iberostar Selection Playa Mita | https://apiimg.iberostar.com/uploads/image/73644/crops/16%3A9/1920/image.jpeg |
| `waves-quetzal.jpg` | Iberostar Waves Quetzal | https://apiimg.iberostar.com/uploads/image/89293/crops/16%3A9/1920/image.jpeg |
| `waves-tucan.jpg` | Iberostar Waves Tucán | https://apiimg.iberostar.com/uploads/image/89212/crops/16%3A9/1920/image.jpeg |

## Galerías por sección

Las fichas reutilizables de México fuera de Riviera Maya, Jamaica, República Dominicana y Brasil cargan dos imágenes oficiales por sección: habitaciones, restaurantes, piscinas y experiencias. Las imágenes se sirven desde `gallery/`; las páginas de origen y los identificadores del CDN quedan registrados en `gallery/sources.json`. El módulo `js/hotel-gallery-data.js` conecta esas rutas locales con las fichas existentes. Los hoteles alias comparten la galería del hotel al que pertenecen.

Las cinco fichas originales de Riviera Maya siguen usando sus imágenes y galerías actuales.

Iberostar Waves Quetzal e Iberostar Waves Tucán (Riviera Maya) usan portada local y galería gastronómica propia, con recorte vertical `2:3` porque el CDN solo sirve esas fotos de restaurante en ese formato.
