# Ask Aaron

Web en inglés para el servicio de segunda opinión de construcción de Aaron Barcellona. El rediseño sigue la composición editorial del prompt Orvante, con la identidad azul marino y dorado del logotipo original, fondos crema y fotografías en color. No utiliza testimonios, clientes ni cifras comerciales inventadas.

## Desarrollo local en Windows

Desde esta carpeta:

```powershell
npm.cmd run build
npm.cmd run dev
```

Abrir http://localhost:4173. No requiere instalación de dependencias. Alternativamente, ejecutar `node scripts/build.mjs` y `node scripts/preview.mjs`. El servidor carga la compilación más reciente; reconstruir y refrescar después de editar fuentes.

## Rediseño inmersivo Laptop Dive

La portada actual adapta la composición Haldoren a Ask Aaron: wordmark gigante detrás del retrato, frase manuscrita, credencial con caída y balanceo, navegación en etiquetas y portátil con perspectiva. El scroll, los gestos y el teclado entran en los tres servicios; cada servicio cambia fotografía, titular, ticket y enlace de consulta. La transición de cámara se construye con CSS y Web Animations; no utiliza el video ni la identidad de los ejemplos ficticios del brief. Las fotografías de servicios existentes sustituyen los videos de portfolios ajenos.

La portada permanece fija a la ventana. “The full picture” abre el contenido anterior en un diálogo desplazable, incluidos el problema, ejemplos, servicios, experiencia y artículos. El intake está en la continuación natural del recorrido después de 03/03; los enlaces como `/#intake` abren esa sección automáticamente. Las páginas de servicios, About, Insights, artículos y formulario conservan sus URLs y contenido, con navegación y detalles visuales compartidos actualizados. Sin JavaScript, el contenido completo permanece accesible. Se respeta movimiento reducido y el anuncio de 20 segundos espera si hay un diálogo o una transición en curso.

El portátil está oculto en la portada y no recibe foco. Aparece al hacer scroll o entrar en los servicios con una transición de posición, escala, giro y opacidad. Al volver a la portada se oculta nuevamente; Aaron y la credencial quedan visibles sin el portátil superpuesto. Después del servicio 03/03, el siguiente scroll o botón continúa hacia la sección de propuesta y contacto, con scroll nativo hasta el footer. No vuelve al servicio 01. El formulario existente se coloca una sola vez en esa sección, conserva la carga de documentos y puede abrirse desde “Let’s talk”, los enlaces de consulta y `/#intake`. Hay un botón para regresar a los servicios; subir desde el inicio de contacto también regresa al servicio seleccionado. El anuncio espera mientras se completa el formulario.

Fuentes del diseño: `src/dive-home.html`, `src/dive.css`, `src/dive.js` y `src/studio.css`. El recorte `assets/aaron-studio-cutout.png` se generó con ImageGen desde la fotografía original; el prompt completo está en `assets/aaron-studio-cutout.prompt.txt`. Las fuentes Inter Tight, Caveat Brush y Anton se sirven localmente; `scripts/prepare-dive-fonts.mjs` permite descargarlas de Google Fonts y no es necesario ejecutarlo en cada build.

`src/dive-contact.css` da continuidad visual al contacto y footer: fondo azul degradado con grano, titulares blancos, acento manuscrito, retrato ampliado de Aaron con “ON YOUR SIDE” encima y pasos en etiquetas de papel. El formulario conserva el diseño de ticket con perforaciones, campos compactos y talón. El footer cierra con el mismo wordmark gigante y la tipografía manuscrita de la portada. Estos estilos solo se cargan en la portada y conservan los campos y el envío de documentos existentes.

`node scripts/dive-qa.mjs` revisa seis tamaños de pantalla, portada, entrada al portátil, los tres servicios y sus imágenes, regreso, formulario dentro del diálogo, enlaces directos y movimiento reducido. Las capturas quedan en `.qa/dive/`. Esta prueba sustituye la revisión de portada anterior `professional-qa.mjs`, cuyas expectativas de cuatro secciones visibles corresponden al diseño previo.

## Diseño y contenido

La portada incluye la apertura editorial con Aaron, una sección visual del problema con planos y aclaraciones, el bloque oscuro con carrusel de ejemplos y servicios en tarjetas blancas, y el cierre con experiencia, artículos e intake. La navegación, las páginas de servicios, About, Insights, privacidad y formulario completo usan el mismo diseño. La interfaz respeta movimiento reducido y permite navegar con teclado.

- `src/index.html`: portada, encabezado y pie compartidos.
- `src/professional.css`: diseño actual, fuentes locales y adaptación móvil.
- `src/professional.js`: revelado de palabras, contadores, navegación activa y aclaraciones de la propuesta.
- `src/app.js`: menú móvil, filtro de artículos y envío del formulario.
- `src/content.json`: servicios, artículos y enlace de calendario (`bookingUrl`). Los artículos iniciales están identificados como borradores pendientes de revisión de Aaron. Videos muestra un estado vacío hasta disponer de contenido real.
- `scripts/build.mjs`: genera las 12 páginas, recursos y Worker en `dist/`.
- `worker/api.js`: recepción de consultas y documentos.

Los archivos anteriores `editorial*`, `experience*`, los widgets y sus pruebas se conservan como código previo; la interfaz actual no los carga. El retrato y el logotipo se conservan sin alterar los archivos originales. El logo del encabezado mantiene sus colores y se integra con el fondo mediante composición CSS; en el pie se utiliza una presentación clara sobre azul marino, sin caja blanca.

## Validación

```powershell
npm.cmd test
node scripts/professional-qa.mjs
```

Las pruebas del sitio verifican páginas, recursos, privacidad de documentos, validación de entradas y fallos de almacenamiento. La revisión de navegador requiere Chrome en Windows y el servidor en el puerto 4173: comprueba seis anchos entre 320 y 1920 px, menú móvil, ejemplo interactivo, subpáginas, filtro Videos, envío real local de un PDF, movimiento reducido y errores JavaScript. Guarda capturas en `.qa/professional/`. El envío de prueba usa qa@example.com y queda únicamente en almacenamiento local.

## Páginas premium de servicios

Las tres páginas de `/services/` tienen fotografía editorial propia, documentos con profundidad 3D y movimiento al cursor, ejemplos con selección de tema, aparición de contenido al recorrer la página, preguntas frecuentes y enlaces al intake con el servicio preseleccionado. Los textos se han resumido en titulares, frases breves y puntos concretos; se eliminó la cita repetida y se compactaron las secciones. La portada conserva su diseño. El movimiento respeta `prefers-reduced-motion`; los ejemplos funcionan sin animación y el contenido principal permanece visible sin JavaScript.

`scripts/service-pages.mjs` contiene las plantillas, ejemplos y preguntas frecuentes de cada servicio. `src/service-pages.css` y `src/service-pages.js` se cargan únicamente en esas tres páginas. Los servicios mantienen sus descripciones y lista de revisión en `src/content.json`. Cada página incluye schema Service y utiliza el mismo formulario y almacenamiento existentes.

Las imágenes nuevas son `assets/service-before.png`, `assets/service-compare.png` y `assets/service-change.png`, generadas con la herramienta integrada ImageGen. Sus prompts completos están en los archivos `assets/service-before.prompt.txt`, `assets/service-compare.prompt.txt` y `assets/service-change.prompt.txt`.

Con el servidor local activo, ejecutar `node scripts/service-pages-qa.mjs` para comprobar las tres páginas en cinco tamaños de 320 a 1920 px, imágenes, ejemplos interactivos, FAQ, efectos 3D, schema, preselección del formulario y movimiento reducido. Las capturas quedan en `.qa/service-pages/`.

## About Aaron

`src/about.html` presenta la fotografía original de Aaron, su experiencia conocida, una exploración interactiva de cuatro ámbitos profesionales, enlaces visuales a servicios y preguntas frecuentes. `src/about.css` y `src/about.js` se cargan únicamente en `/about`. Las entradas de texto, el contador y la inclinación del retrato respetan movimiento reducido. La fotografía mantiene su proporción original y los archivos originales no se modifican.

Con el servidor local activo, `node scripts/about-qa.mjs` revisa cinco tamaños entre 320 y 1920 px, la fotografía, el contador, las cuatro vistas, las FAQ, los enlaces de consulta y servicios, schema AboutPage y movimiento reducido. Las capturas se guardan en `.qa/about-1440.png` y `.qa/about-390.png`.

## Ventana flotante de consulta

El anuncio comparte el diseño Laptop Dive: ticket rectangular, retrato recortado sobre azul marino, titular grueso, firma manuscrita dorada, separación perforada y código de barras decorativo. En móvil, el retrato pasa a una franja superior compacta. La entrada utiliza una caída suave con giro y respeta movimiento reducido. Las fuentes se sirven localmente también en las páginas interiores.

`src/floating-cta.html`, `src/floating-cta.css` y `src/floating-cta.js` muestran un anuncio modal centrado con la fotografía de Aaron y acceso a la consulta gratuita. Utiliza un diálogo nativo con fondo oscurecido y desenfocado. Aparece tras 20 segundos de cargar cada página, incluso si ya se cerró en una visita anterior. Se muestra una sola vez por carga. Se cierra con la X, Escape o un clic fuera. Al abrir, el foco pasa al cierre y permanece dentro del diálogo; al cerrar, se restaura al elemento anterior.

No aparece en `/start`. Mientras el usuario escribe, hay otro diálogo o menú móvil abierto, o la pestaña está oculta, espera y vuelve a comprobar cada segundo. En las páginas de servicios, el enlace conserva la selección del servicio. Respeta movimiento reducido. No guarda preferencias en el navegador ni envía datos a servicios externos.

`node scripts/floating-cta-qa.mjs` verifica el intervalo real de 20 segundos, reaparición al recargar aunque existan preferencias antiguas, selección del servicio, tres tamaños y movimiento reducido. Las capturas quedan en `.qa/floating-cta-1440.png` y `.qa/floating-cta-390.png`.

## Consulta y documentos

Los formularios de portada y `/start` utilizan `/api/intake`. Admiten hasta cinco archivos y 20 MB en total: PDF, Word, JPG, PNG y WebP. El servidor local guarda consultas y documentos en `.local-intakes/`, excluido de Git. No envía correos ni reserva citas reales.

Configurar `bookingUrl` en `src/content.json` para ofrecer un enlace al calendario después de un envío correcto. Mientras esté vacío, el sitio solicita una consulta y aclara que el horario será confirmado. El formulario completo `/start` permite indicar día, hora y zona horaria preferidos. La consulta inicial de 15 minutos es gratuita; el alcance y precio de una revisión se acuerdan por separado.

## Presentación y Field notes en Laptop Dive

`src/dive-panels.css` adapta la ventana de presentación al fondo azul, tipografía y tarjetas de la portada. Field notes se abre en esa misma ventana; sus filtros y la lectura de artículos funcionan sin abandonar la experiencia. Las rutas directas `/insights` y sus artículos conservan sus URLs y utilizan el mismo estilo visual.

`scripts/field-notes.mjs` genera el listado y los artículos desde el contenido existente. `src/dive-panels.js` controla los filtros, la lectura y el regreso al listado. `node scripts/panels-qa.mjs` comprueba las ventanas, filtros, artículos, cierre con Escape, enlaces directos y movimiento reducido en 320, 390 y 1440 px. Las capturas se guardan en `.qa/panels/`.

## Hosting y lanzamiento

El repositorio `javividalm11/ASKAARON` está conectado al proyecto `askaaron` de Cloudflare Pages. Los cambios subidos a `main` activan el despliegue automático en `https://askaaron.pages.dev`. Configuración: comando `npm run build`, directorio `dist/pages`, Worker `_worker.js` y archivo `wrangler.jsonc`. Este flujo no modifica el dominio ni DNS.

Para recibir documentos en producción hay que vincular un bucket R2 privado como `BUCKET` y volver a desplegar. Sin almacenamiento configurado, el formulario informa del error y no afirma haber guardado la solicitud. Conectar también el calendario y el destino de notificaciones, revisar los artículos y la privacidad con Aaron y asociar AaronBarcellona.com en el proveedor de hosting.

El sitio incluye títulos y descripciones por página, canonical y Open Graph, schema del servicio y fundador, sitemap, robots.txt y URLs limpias. La edición de artículos se realiza en el JSON y requiere recompilación; no se ha añadido un CMS.
