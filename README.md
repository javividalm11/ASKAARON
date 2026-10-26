# Ask Aaron

Sitio editorial en inglés para Aaron Barcellona, sin dependencias de ejecución. Diseño responsive, tres páginas de servicios, artículos originales, filtros, preguntas frecuentes e intake con carga privada de documentos.

## Desarrollo

`npm run build` genera el Worker y sus recursos en `dist/`. `npm test` verifica páginas, enlaces y recepción de archivos. `npm run dev` abre el servidor local en http://localhost:4173. Los envíos locales se guardan en `.local-intakes/`, excluido de Git. No son envíos de producción.

## Contenido

Editar `src/content.json` para servicios y artículos; agregar artículos dentro de `articles` con un slug único, categoría, título, introducción y secciones. Reconstruir y desplegar después de editar. Los artículos iniciales son borradores para revisión de Aaron. El filtro Videos permanece vacío hasta disponer de contenido real; no se inventan videos ni testimonios. La imagen editorial procede de Unsplash, archivo `photo-1600210492486-724fe5c67fb0`. El logo es el original suministrado por el cliente.

## Reservas y documentos

Definir `bookingUrl` en `src/content.json` cuando exista un calendario. Por ahora se solicita día, hora y zona horaria; no se confirma una reserva. Los registros y documentos se guardan bajo `intakes/<id>/` en el bucket R2 privado configurado como `BUCKET`. No existen rutas públicas para recuperar documentos. El registro `request.json` contiene los datos de contacto y las claves de los archivos. No hay notificaciones por correo configuradas: antes del lanzamiento público se debe establecer el proceso de revisión de consultas y conectar el correo o CRM de destino. Configurar también retención, revisión de la política de privacidad, protección antispam con límites en hosting y acceso operativo a los documentos. No se necesita una cuenta para enviar el formulario.

## Publicación

La publicación inicial de Sites es privada. El dominio AaronBarcellona.com requiere asociación del dominio y configuración DNS para el lanzamiento público; no se ha modificado el DNS. Antes del lanzamiento, revisar artículos, datos de contacto, calendario y política de privacidad con Aaron. El SEO incluye metadatos por página, canonical dinámico, Open Graph, schema del negocio, sitemap y robots.txt. Las URLs canónicas usan el dominio que sirve la petición.
