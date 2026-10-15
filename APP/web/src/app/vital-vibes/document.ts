// Standalone document: no root/customer layout, analytics, cookies or live data.
export const vitalVibesDocument = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="description" content="Concepto de menú visual basado en las fotografías de Vital Vibes aportadas por Anthony. Pendiente de confirmación de la propietaria.">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">
  <meta name="theme-color" content="#244a3e">
  <title>Vital Vibes · concepto visual</title>
  <link rel="icon" href="/vital-vibes/assets/sprout.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/vital-vibes/style.css">
  <link rel="stylesheet" href="/vital-vibes/reference-theme.css">
  <link rel="stylesheet" href="/vital-vibes/photographic.css">
  <script src="/vital-vibes/menu-data.js" defer></script><script src="/vital-vibes/artwork.js" defer></script><script src="/vital-vibes/app.js" defer></script>
</head>
<body>
  <a class="skip" href="#counter">Ir a los vasos ilustrativos</a>
  <div class="concept-note">Concepto · menú por confirmar</div>
  <header class="masthead">
    <div class="identity"><img class="real-logo" src="/vital-vibes/assets/vital-vibes-logo.webp" width="94" height="80" alt="Vital Vibes"><span class="city">Barranquilla, Colombia</span></div>
    <div class="tools">
      <button class="icon-button" id="labels" type="button" aria-label="Mostrar nombres de las ilustraciones" aria-pressed="false" title="Mostrar nombres"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18M12 5v14M8 19h8"/></svg></button>
      <button class="icon-button" id="about" type="button" aria-label="Información del concepto" aria-haspopup="dialog" title="Información del concepto"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/></svg></button>
    </div>
  </header>
  <main>
    <section class="shop" aria-labelledby="shop-title">
      <div class="intro"><span class="eyebrow">Tu pausa, a tu manera</span><h1 id="shop-title">Elige con los ojos.</h1><p>Toca. Descubre. Antójate.</p></div>
      <div class="wall" aria-hidden="true"><div class="arch"><div class="sun"></div><div class="sunline"></div></div><div class="window-light"></div><img class="palm" src="/vital-vibes/assets/flowers.svg" width="500" height="600" alt=""></div>
      <div class="counter-scene" id="counter" tabindex="-1">
        <div class="countertop" aria-hidden="true"></div>
        <div class="products" id="category-tray" role="group" aria-label="Explorar las siete categorías del menú"></div>
        <div class="tray-nav"><button class="icon-button" id="previous" aria-label="Ver categorías anteriores" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg></button><span aria-hidden="true">Desliza el mostrador</span><button class="icon-button" id="next" aria-label="Ver más categorías" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7"/></svg></button></div>
        <div class="counterfront" aria-hidden="true"><span>v</span><svg viewBox="0 0 120 55"><path d="M5 32Q30 7 58 32T115 32M5 46Q30 21 58 46T115 46"/></svg></div>
      </div>
      <div class="scene-caption"><span class="sprout" aria-hidden="true"><svg viewBox="0 0 30 30"><path d="M15 25V13M15 18C3 18 3 5 3 5s13 0 12 13ZM15 14C27 14 27 2 27 2S14 2 15 14Z"/></svg></span><p>La experiencia empieza aquí.</p></div>
    </section>
    <noscript><p class="no-script">Categorías en las fotos: Protein Shakes, Special Drinks, Batidos, Bebidas, Iced Protein, Refrescantes y Bebidas Calientes. Activa JavaScript para explorar el mostrador. Ingredientes y precios pendientes de confirmar.</p></noscript>
  </main>
  <footer><span>Imágenes creadas con IA · menú por confirmar</span><button type="button" id="details">Sobre este diseño <span aria-hidden="true">↗</span></button></footer>
  <dialog class="sheet" id="product-dialog" aria-labelledby="product-title" aria-describedby="product-disclaimer">
    <button class="icon-button close" type="button" data-close aria-label="Cerrar detalles"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    <div class="sheet-art"><img id="detail-art" src="/vital-vibes/assets/cup-green.svg" width="260" height="420" alt=""></div>
    <div class="sheet-content"><p class="eyebrow">El menú, de cerca</p><h2 id="product-title">Protein Shakes</h2><p id="product-disclaimer">Nombres leídos en las fotos de referencia. Pendientes de confirmación de la propietaria.</p><div id="menu-items"></div><details class="ingredient-block"><summary>Ingredientes y alérgenos</summary><p>No se leen con suficiente claridad en las fotos. Pendientes de confirmar; consulta con el local antes de consumir.</p></details><p class="small-note" id="category-note">Precios y tamaños pendientes de confirmar. Imagen creada con IA; representación ilustrativa, no receta exacta.</p><button type="button" class="back" data-close>Volver al mostrador <span aria-hidden="true">↗</span></button></div>
  </dialog>
  <dialog class="sheet about-sheet" id="about-dialog" aria-labelledby="about-title">
    <button class="icon-button close" type="button" data-close aria-label="Cerrar información"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    <div class="sheet-content"><p class="eyebrow">Concepto visual</p><h2 id="about-title">Su esencia. Otra forma de explorar.</h2><p>Una propuesta para Vital Vibes, en Barranquilla, basada en las tres fotos de menú y productos aportadas por Anthony.</p><p>El verde, el coral, los vasos con tapa domo y las flores inspiran este mostrador. El logo se recuperó de la foto del vaso aportada por el usuario; se omitió el texto pequeño que no se lee. Las imágenes de bebidas se crearon con IA y son representaciones ilustrativas, no fotografías de los productos reales ni recetas confirmadas.</p><div class="ingredient-block"><h3>Para completar el menú</h3><ul><li>Confirmar nombres, ingredientes, alérgenos, tamaños y precios.</li><li>Confirmar el archivo original del logo y recibir fotos originales de productos y local.</li><li>Confirmar enlace oficial, dirección, horarios y contacto.</li></ul></div><p class="small-note">Las fotos están parcialmente cortadas. Este concepto no permite pedidos ni pagos.</p><button class="back" type="button" data-close>Volver al mostrador <span aria-hidden="true">↗</span></button></div>
  </dialog>
</body>
</html>
`;
