# Guion de Reunión — Aprobación del Formulario `/request-update`

Un guion sencillo, en español, para que Anthony le muestre al dueño el
formulario de solicitudes en **modo demostración** y obtenga su aprobación
antes de construir el guardado en base de datos, las notificaciones, la carga
de archivos y el panel de administración.

> Documento de referencia. No cambia código. El formulario está en modo
> demostración: todavía no envía ni guarda información.

---

## 1. Apertura

**Decir al dueño:**

> "Le voy a mostrar un formulario donde, en el futuro, usted podrá pedir
> cualquier cambio — menú, precios, fotos, stickers, sitio web, juego o
> promociones — desde su celular.
>
> Por ahora está en **modo demostración**: **no envía ni guarda ninguna
> información todavía**. Solo quiero que vea cómo se vería y me diga si los
> campos y las palabras le parecen bien antes de conectarlo de verdad."

Puntos clave a recalcar:
- Es una vista previa.
- Nada se envía ni se guarda aún.
- Su opinión define lo que se construye después.

---

## 2. Recorrido de la demostración

Siga este orden en el celular o la pantalla:

1. **Abrir `/owner-presentation`** — mostrar la presentación general de la
   marca y, en la sección de "Flujo para pedir cambios", el botón
   **"Probar formulario de cambios"**.
2. **Abrir `/request-update`** — explicar que aquí llegan las solicitudes.
3. **Mostrar los tipos de solicitud** — Menú, Precio, Producto, Foto, Sticker,
   Sitio web, Juego, Promoción, Otro. Preguntar si reconoce todos.
4. **Mostrar la prioridad** — Baja, Normal, Urgente.
5. **Mostrar el área de carga de archivos (desactivada)** — explicar:
   "Aquí pronto podrá adjuntar fotos, capturas del menú o archivos de stickers.
   Todavía no está activo."
6. **Enviar una solicitud de demostración** — llenar un ejemplo simple
   (ej. cambiar el precio de un café) y presionar **"Enviar solicitud"**.
7. **Mostrar el mensaje de confirmación** — leer en voz alta:
   "Solicitud capturada en modo demostración. En la versión final, Anthony la
   recibirá al instante y quedará guardada en el panel de solicitudes."

---

## 3. Preguntas de aprobación

Hacer al dueño y anotar respuestas:

- **¿Los campos están correctos?** ¿Falta o sobra alguno?
- **¿Hay que renombrar algún tipo de solicitud?** (¿"Sitio web", "Promoción"…?)
- **¿Quién debe recibir las notificaciones?** (¿Solo Anthony? ¿Alguien más?)
- **¿Las solicitudes urgentes deben avisar también por mensaje de texto?**
- **¿Qué tipos de archivo se deben aceptar?** (fotos, PDF, capturas del menú,
  archivos de stickers…)
- **¿Quién debe tener acceso al panel de administración?**

---

## 4. Explicación de privacidad

**Decir al dueño:**

> "Quiero que se sienta tranquilo con la privacidad:
>
> - En la versión final, las solicitudes **solo se guardarán después de su
>   aprobación**.
> - Los **archivos que se suban se guardarán de forma segura y privada**.
> - **Los clientes del público no ven** estas solicitudes — solo las personas
>   autorizadas.
> - **No se maneja ninguna información de pago** en este formulario."

Recalcar: las páginas públicas (juego y menú) no recopilan datos personales.

---

## 5. Cierre

**Pedir la decisión:**

> "¿Está de acuerdo con seguir adelante?
> - **Aprobado tal como está**
> - **Aprobado con cambios** (¿cuáles?)
> - **Todavía no aprobado**"

**Explicar la siguiente fase (después de la aprobación):**

> "Una vez aprobado, lo construimos por pasos:
> 1. **Guardar las solicitudes en una base de datos** segura.
> 2. **Notificaciones por correo** (y por texto para urgentes, si lo desea).
> 3. **Carga de archivos** (fotos, menús, stickers).
> 4. **Panel de administración** para revisar y dar seguimiento.
>
> Hasta entonces, todo sigue en modo demostración y nada se envía ni se guarda."

Cerrar agradeciendo y confirmando el próximo paso acordado.

---

> Después de la reunión, registrar la decisión en
> `OWNER_REQUEST_APPROVAL_CHECKLIST.md` y, si hay luz verde, comenzar la
> **Fase 1** según `OWNER_REQUEST_PHASE_1_DATABASE_PLAN.md`.
