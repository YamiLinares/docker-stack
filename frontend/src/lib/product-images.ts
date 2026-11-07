/**
 * Fotos de producto. La API no tiene campo de imagen, así que el frontend asocia
 * una foto local a cada SKU (public/productos, 800x800 WebP).
 *
 * Son fotos reales con licencia libre de Wikimedia Commons: ilustran el tipo de
 * producto, no el artículo exacto. Las licencias CC BY y CC BY-SA exigen citar
 * al autor, por eso cada entrada guarda autor, licencia y página de origen
 * (se muestran en la ficha del producto). Las fotos se recortaron y redimensionaron.
 * Si un SKU no está aquí, se usa la ilustración SVG (ProductArt).
 */
export type ProductImage = { src: string; alt: string; author: string; license: string; source: string };

export const PRODUCT_IMAGES: Readonly<Record<string, ProductImage>> = {
  "ACC-001": { "src": "/productos/acc-001.webp", "alt": "Cargadores USB-C de pared", "author": "4300streetcar", "license": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:Silicon_vs_GaN_30W_USB-C_chargers.jpg" },
  "ACC-002": { "src": "/productos/acc-002.webp", "alt": "Laptop sobre una funda que también sirve de soporte", "author": "Richardinsky", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Cozistyle_Stand_Sleeve.jpg" },
  "ACC-003": { "src": "/productos/acc-003.webp", "alt": "Soporte plegable de aluminio para laptop", "author": "Solijon Solayev", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Laptop_stand.jpg" },
  "DEP-001": { "src": "/productos/dep-001.webp", "alt": "Mochilas urbanas grises para laptop", "author": "Wide Awake!", "license": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:Laptop_backpacks_from_Mr._DIY_at_Ayala_Center_Cebu_(2025-02-24).jpg" },
  "DEP-002": { "src": "/productos/dep-002.webp", "alt": "Persona entrenando con una banda de resistencia", "author": "Nenad Stojkovic", "license": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Attractive_young_woman_have_exercise_with_tape_in_the_gym.jpg" },
  "DEP-003": { "src": "/productos/dep-003.webp", "alt": "Reloj deportivo con GPS en la muñeca", "author": "Tristan Haskins", "license": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Garmin_Forerunner_910XT.JPG" },
  "HOG-001": { "src": "/productos/hog-001.webp", "alt": "Cafetera de goteo con jarra térmica de acero", "author": "Infrogmation of New Orleans", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Hamilton_Beach_home_coffee_maker.jpg" },
  "HOG-002": { "src": "/productos/hog-002.webp", "alt": "Lámpara de escritorio con brazo flexible", "author": "AirbusA330772673", "license": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:A_desk_lamp.jpg" },
  "HOG-003": { "src": "/productos/hog-003.webp", "alt": "Silla de oficina ergonómica con apoyabrazos", "author": "14GTR", "license": "CC0", "source": "https://commons.wikimedia.org/wiki/File:Prototype_ergonomic_office_chair,_V%26A_London.jpg" },
  "HOG-004": { "src": "/productos/hog-004.webp", "alt": "Botella térmica de acero inoxidable", "author": "Montclair Film", "license": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Montclair_Film_Festival_Water_Bottle.jpg" },
  "LIB-001": { "src": "/productos/lib-001.webp", "alt": "Libros de programación en un estante", "author": "User:K.lee", "license": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Programming_language_textbooks.jpg" },
  "LIB-002": { "src": "/productos/lib-002.webp", "alt": "Libro técnico abierto sobre un escritorio", "author": "Aleks Dorohovich", "license": "CC0", "source": "https://commons.wikimedia.org/wiki/File:Books,_pencils,_laptop,_and_iphone_on_a_desk_(Unsplash).jpg" },
  "TEC-001": { "src": "/productos/tec-001.webp", "alt": "Teclado mecánico compacto sin teclado numérico", "author": "Patrick Breen", "license": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:2018_Bay_Area_Mechanical_Keyboard_Meetup_(45945702751).jpg" },
  "TEC-002": { "src": "/productos/tec-002.webp", "alt": "Mouse vertical ergonómico sobre un escritorio", "author": "Ilya Plekhanov", "license": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Delux_M618_vertical_mouse.jpg" },
  "TEC-003": { "src": "/productos/tec-003.webp", "alt": "Monitor de computadora sobre fondo blanco", "author": "florisla from Mechelen, Belgium", "license": "CC BY-SA 2.0", "source": "https://commons.wikimedia.org/wiki/File:LG_L194WT-SF_LCD_monitor.jpg" },
  "TEC-004": { "src": "/productos/tec-004.webp", "alt": "Audífonos over-ear con almohadillas acolchadas", "author": "PJ", "license": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Headphones_1.jpg" },
  "TEC-005": { "src": "/productos/tec-005.webp", "alt": "Cámara web con soporte", "author": "WrS.tm.pl", "license": "CC0", "source": "https://commons.wikimedia.org/wiki/File:USB_webcam_for_PC.jpg" },
  "TEC-006": { "src": "/productos/tec-006.webp", "alt": "Unidad SSD NVMe en formato M.2", "author": "User5515", "license": "CC0", "source": "https://commons.wikimedia.org/wiki/File:A_2230_NVME_SSD.jpg" },
  "TEC-007": { "src": "/productos/tec-007.webp", "alt": "Hub USB-C de aluminio con puertos USB y lector de tarjetas", "author": "RuinDig/Yuki Uchida", "license": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:TUNEWEAR-ALMIGHTY-DOCK-nano1_02.jpg" },
  "TEC-008": { "src": "/productos/tec-008.webp", "alt": "Laptop ultraligera abierta", "author": "Intel Free Press", "license": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Asus_x21_ultrabook.jpg" },
};

export function productImage(sku: string): ProductImage | null {
  return PRODUCT_IMAGES[sku.trim().toUpperCase()] ?? null;
}
