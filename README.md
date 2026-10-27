# Ask Aaron

Sitio editorial en inglés para Aaron Barcellona, sin dependencias de ejecución. La portada sigue la referencia editorial confirmada: hero nocturno con retrato, propuestas flotantes, problema visualizado, tres servicios, pasos con formulario dorado, Insights y cierre. Incluye páginas de servicios, About, artículos e intake con carga privada de documentos. El formulario de la portada y el de `/start` usan el mismo endpoint privado.

## Desarrollo

`npm run build` genera el Worker y sus recursos en `dist/`. `npm test` verifica páginas, enlaces y recepción de archivos. `npm run dev` abre el servidor local en http://localhost:4173. Los envíos locales se guardan en `.local-intakes/`, excluido de Git. No son envíos de producción.

El código vigente está en `src/`, `worker/` y `scripts/`; los recursos utilizados y sus licencias están en `assets/`. Las capturas y el perfil temporal del navegador de verificación se generan dentro de `.qa/`, excluido de Git, para mantener limpia la raíz del proyecto. Los DOCX y PDF originales se conservan en la carpeta superior. Se mantiene `dist/` generado para que el servidor local pueda servir la web.

## Contenido

Editar `src/content.json` para servicios y artículos; agregar artículos dentro de `articles` con un slug único, categoría, título, introducción y secciones. Reconstruir y desplegar después de editar. Los artículos iniciales son borradores para revisión de Aaron. El filtro Videos permanece vacío hasta disponer de contenido real. El botón del hero abre un explicador interactivo de tres pasos. `src/editorial.css` y `src/editorial-motion.js` contienen la base del diseño y sus efectos; `src/experience.css` adapta la presentación a la referencia FundedNext con la identidad azul marino y dorado de Ask Aaron. Los recursos generados y sus prompts están documentados en `assets/editorial-assets.txt`. El retrato fue reconstruido a partir de la referencia que el usuario confirmó como Aaron. El logotipo original de `assets/logo.png` se utiliza en el encabezado y pie de página.

## Asistente y CTA flotante

`src/experience.js` contiene el asistente local de preguntas frecuentes en inglés y español. Se identifica como guía automática y responde a partir de los servicios, límites de carga y proceso publicados. No llama a una API de IA ni almacena los mensajes en el servidor. Para cambiar sus respuestas, actualizar `getGuideAnswer`; las pruebas están en `scripts/experience.test.mjs`. El chat enlaza al formulario para revisar un proyecto concreto.

`src/conversion-widgets.html` contiene el chat y el anuncio de consulta. El anuncio se puede abrir manualmente o aparecer una vez tras 14 segundos y 160 px de lectura; no se abre mientras se escribe, se usa el chat o hay un diálogo abierto. Su cierre se recuerda durante la sesión mediante `sessionStorage`. Ambos controles funcionan con Escape y restauran el foco. `src/clarity-stats.html` presenta datos ya conocidos del servicio (25+ años, tres servicios y consulta de 15 minutos). La fuente Plus Jakarta Sans se sirve localmente; su licencia se conserva en `assets/Plus-Jakarta-Sans-OFL.txt`.

## Verificación visual

`node scripts/redesign-qa.mjs` comprueba seis anchos (320 a 1920 px), menú móvil, explicador, recortes, chat, respuestas en español, renderizado seguro de mensajes, anuncio automático, recuerdo del cierre, movimiento reducido y errores de JavaScript; guarda capturas en `.qa/`. Este verificador usa Chrome instalado en Windows. El WebGL del hero se limita a una capa transparente de partículas y pausa al salir de pantalla. Se añaden contadores al entrar en pantalla, una banda continua y brillo al pasar el cursor sobre servicios y botones. Los efectos respetan movimiento reducido. El servidor local recarga la compilación después de `npm run build`; refrescar el navegador con Ctrl+F5 para descartar estilos en caché.

## Reservas y documentos

Definir `bookingUrl` en `src/content.json` cuando exista un calendario. Por ahora se solicita día, hora y zona horaria; no se confirma una reserva. Los registros y documentos se guardan bajo `intakes/<id>/` en el bucket R2 privado configurado como `BUCKET`. No existen rutas públicas para recuperar documentos. El registro `request.json` contiene los datos de contacto y las claves de los archivos. No hay notificaciones por correo configuradas: antes del lanzamiento público se debe establecer el proceso de revisión de consultas y conectar el correo o CRM de destino. Configurar también retención, revisión de la política de privacidad, protección antispam con límites en hosting y acceso operativo a los documentos. No se necesita una cuenta para enviar el formulario.

## Publicación

La publicación inicial de Sites es privada. El dominio AaronBarcellona.com requiere asociación del dominio y configuración DNS para el lanzamiento público; no se ha modificado el DNS. Antes del lanzamiento, revisar artículos, datos de contacto, calendario y política de privacidad con Aaron. El SEO incluye metadatos por página, canonical dinámico, Open Graph, schema del negocio, sitemap y robots.txt. Las URLs canónicas usan el dominio que sirve la petición.
