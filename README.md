# RodeForge Interactive

Web oficial estática del estudio, preparada para GitHub Pages. HTML, CSS y JavaScript sin compilación, dependencias de ejecución ni servicios externos de fuentes.

## Vista local

Desde esta carpeta:

```sh
python -m http.server 4173
```

Abrir `http://localhost:4173`. La web también funciona como archivos estáticos; usar HTTP permite comprobar el vídeo y las funciones del portapapeles.

## Publicación en GitHub Pages

Publicar la raíz de la rama `main` en **Settings → Pages → Deploy from a branch → main / (root)**. Todos los recursos usan rutas relativas para funcionar en `https://rodeypunto.github.io/rodeforge/`.

## Contenido

- BomBait: lanzamiento próximo, todavía sin enlace de tienda.
- CoinsPiracy: en desarrollo.
- Contacto: `rodeatope@gmail.com`.
- Presentación de Rode basada en su relato: más de 15 años desarrollando software empresarial y puesto actual como Head of Data en una empresa con presencia global. La creación de videojuegos, los juegos de mesa y la participación en el podcast Gamelx se presentan como actividades propias, sin identificar el estudio como parte de Gamelx.
- Dirección de marca: símbolo monocromo blanco renderizado desde las piezas transparentes, fondo limpio y el color de los juegos como protagonista. La forja queda como metáfora de experimentación y creación.
- Texto en español e inglés en `content.js`; contenido inicial español accesible sin JavaScript.
- Las fichas de los juegos y la intro se abren en diálogos nativos con teclado y cierre por Escape.
- Cada ficha incluye un carrusel de tres capturas reales: flechas, miniaturas, teclado (←, →, Inicio y Fin) y gestos horizontales en pantallas táctiles. Las capturas se muestran completas, sin recortes ni reproducción automática.
- Sin analítica, formularios que simulen envíos ni cookies de terceros. Solo se guarda la preferencia de idioma en localStorage.
- Se respeta `prefers-reduced-motion`. El vídeo solo reproduce sonido tras pulsar el botón de la intro.

Las rutas y los estados de los juegos deben actualizarse cuando exista un lanzamiento real. No se muestran cifras, testimonios ni partners no confirmados.

## Recursos

Arte original de los proyectos locales BomBait y CoinsPiracy; identidad visual y vídeo de RodeForge Interactive. Las imágenes son recursos visuales de los juegos, sin simular capturas de gameplay. La ficha de BomBait sí incluye una captura real de su menú.

Derivados optimizados para web: `tools/prepare_assets.py` (requiere Python e imageio-ffmpeg en el equipo de producción; no es necesario ejecutarlo para publicar).

Intro: música “Volatile Reaction”, Kevin MacLeod (incompetech.com), editada y mezclada con voz y efectos. Licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Fuente](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400039). Atribución también disponible en el diálogo «Créditos» de la web.

Fuentes Barlow Condensed y Manrope: SIL Open Font License. Licencias incluidas en `assets/fonts`.


## Refinamiento editorial

`styles.css` conserva la base visual y `refinements.css` añade la evolución del sistema: hero asimétrico, colección editorial de juegos, historia del creador, filosofía numerada, contacto para publishers y footer. `script.js` gestiona interacción, navegación activa, idioma y galerías; `content.js` mantiene los textos bilingües y datos de los juegos. Se puede enlazar directamente a `?lang=es` o `?lang=en`.

### Verificación

```sh
node --check script.js
node --check content.js
node tools/check_site.mjs
git diff --check
```

La comprobación valida paridad de traducciones, recursos locales, anclas, IDs únicos, jerarquía principal y galerías. No existe etapa de build ni framework: GitHub Pages sirve estos archivos directamente. Revisar también en navegador las resoluciones móvil, tablet, portátil y escritorio, el teclado, los diálogos y el selector de idioma. Las métricas de campo de Core Web Vitals requieren una publicación y tráfico real.

Pendiente de recursos reales: enlaces de tienda cuando se publiquen los juegos, press kit y tráileres de gameplay. No se simulan sus botones. Android se identifica como plataforma objetivo, no como disponibilidad de descarga.


## Sistema cromático

`palette.css` centraliza la paleta definitiva y sus roles. Las hojas anteriores usan esos tokens; los alias mantienen la compatibilidad de los componentes. Solo el arte de CoinsPiracy conserva sus tonos de oro y crema como tokens específicos del juego. El canvas ambiental usa el token RGB neutro de la misma hoja. No se modifican los archivos de imagen ni el vídeo.

`node tools/check_palette.mjs` comprueba contraste AA de textos y acciones sobre las superficies de la interfaz y detecta literales cromáticos fuera de la hoja central.


## Una página, muchos mundos

La web conserva una única página (`index.html`). No hay rutas por videojuego, CMS, backend ni filtros de catálogo. Las tarjetas editoriales abren un diálogo nativo con capturas reales, descripción, género, plataforma objetivo y estado. El cierre vuelve a enfocar la tarjeta, y el diálogo mantiene el recorrido de Tab y el cierre por Escape. Las capturas conservan flechas, miniaturas, teclado y gestos táctiles.

### Añadir o actualizar un juego

1. Edita **solo el registro del juego en `content.js`**: nombre, `art`, textos `es`/`en`, `gallery`, `links` y `trailer`.
2. Copia los recursos reales a `assets/images` o `assets/video` y referencia sus rutas relativas. `art.logo`, `art.foreground` y `art.wordmark` son opcionales. Las capturas incluyen `src`, `es` y `en`. Si no hay capturas, la ficha muestra el arte principal.
3. Deja `links: []` y `trailer: null` cuando no existan materiales. Un enlace real tiene `{url, label: {es, en}}`; un vídeo disponible tiene `{src, poster}`. Los vídeos requieren reproducción manual y se pausan al cerrar la ficha.
4. Ejecuta `node tools/sync_games.mjs` para actualizar la copia HTML española inicial de las tarjetas (SEO y contenido sin JavaScript). En el navegador, la misma plantilla lee los datos automáticamente.
5. Ejecuta `node tools/check_site.mjs`, `node tools/check_palette.mjs` y `node --check script.js`.

`game-cards.js` es la única plantilla de tarjeta, compartida por el navegador y la herramienta opcional de sincronización. `gallery.css` controla la galería y las fichas sobre el sistema cromático existente. No hay compilación ni dependencias de npm para servir la página.

No se han añadido páginas de catálogo ni fichas independientes del planteamiento descartado. Tampoco se han creado tráilers, fechas o enlaces de tienda que no existen.
