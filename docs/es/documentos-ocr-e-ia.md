# Manual de Usuario: Digitalización, Cámara, OCR e IA

Este documento describe el flujo completo de captura, preprocesamiento de imágenes, reconocimiento óptico de caracteres (OCR) y estructuración mediante Inteligencia Artificial en el módulo de **Documentos y Vouchers** (`/admin/user/documents`).

---

## 1. Vista Dividida de Documentos (`/admin/user/documents`)

La pantalla de gestión documental está diseñada con una interfaz dividida (*split-screen*) en dos paneles redimensionables:

### 1.1. Panel Izquierdo (30%): Filtro de Ámbito y Árbol Jerárquico
- **Selector de Ámbito (`selectedScopeUuid`)**: Permite filtrar las tarjetas y comprobantes asociados a un contexto financiero específico o visualizar **"Todos los Ámbitos" (`ALL`)**.
- **Árbol de Navegación (`<app-tree-view>`)**: Construye dinámicamente una jerarquía de tres niveles a partir de las tarjetas registradas:
  1. **Nivel 1 — Tarjeta**: Muestra el número enmascarado de la tarjeta y su descripción.
  2. **Nivel 2 — Período (`YYYY-MM`)**: Agrupa los comprobantes según el año y mes de la transacción.
  3. **Nivel 3 — Comprobante (Hoja)**: Representa cada voucher individual con su número de transacción y fecha. Al hacer clic sobre un comprobante, se abre el panel lateral (*Drawer*) con su detalle.

### 1.2. Panel Derecho (70%): Carga de Archivos, Cámara y Vouchers Pendientes
En la mitad superior dispone de una zona dividida de ingreso de comprobantes:
- **Subida de Archivos (`nz-upload` Drag & Drop)**: Permite arrastrar o seleccionar imágenes de tickets/vouchers desde el dispositivo, convirtiéndolas a Base64 y agregándolas a la bandeja de pendientes.
- **Botón `"Sacar Foto"`**: Inicia el componente de cámara WebRTC (`<app-camera>`) para fotografiar un comprobante físico en el momento.

En la mitad inferior se muestra la **Grilla de Vouchers Pendientes (`pendingVouchers`)**, persistida localmente mediante `PendingVouchersService`. Cada tarjeta en la grilla muestra una miniatura de la imagen y su estado actual:
- **Pendiente de leer** (naranja): Imagen recién cargada o fotografiada.
- **Leído** (azul): Imagen procesada mediante OCR o IA con texto extraído.
- **Guardado** (verde): Comprobante confirmado.
Desde cada miniatura se puede abrir el detalle (ícono de ojo) o eliminar el borrador (ícono de papelera).

---

## 2. Captura con Cámara WebRTC (`<app-camera>`)

Al presionar **"Sacar Foto"**, se despliega el visor de captura fotográfica en vivo:
1. **Alternancia de Cámara (`toggleCamera`)**: Permite conmutar entre la cámara trasera (`environment`, ideal para enfocar tickets sobre una mesa en dispositivos móviles) y la cámara frontal (`user`).
2. **Captura de Fotograma (`takePhoto`)**: Congela el fotograma actual del flujo de video en un lienzo `<canvas>` con la resolución nativa del sensor y genera una imagen PNG en Base64.
3. **Vista Previa y Confirmación**: Tras capturar la foto, el usuario puede elegir entre:
   - **Confirmar (`confirmPhoto`)**: Envía la fotografía capturada hacia el **Editor de Imagen** para su recorte y mejora antes de guardarla.
   - **Intentar de nuevo (`retakePhoto`)**: Descarta la toma actual y reactiva la cámara en vivo.
   - **Cancelar (`cancelCamera`)**: Detiene el stream de video y regresa a la vista de documentos.

---

## 3. Editor de Imagen y Preprocesamiento OCR (`<app-image-editor>`)

Antes de almacenar una fotografía tomada con la cámara, el componente `<app-image-editor>` (basado en `Cropper.js`) permite optimizar la imagen para maximizar la precisión del motor de OCR:

- **Recorte Interactivo**: Marco ajustable libremente para aislar únicamente el área impresa del ticket o cupón de tarjeta, descartando fondos ruidosos.
- **Rotación (`rotateLeft` / `rotateRight`)**: Gira la imagen en incrementos de `-90°` o `+90°`.
- **Volteo (`flipHorizontal` / `flipVertical`)**: Invierte el eje horizontal o vertical de la imagen.
- **Zoom (`zoomIn` / `zoomOut`)**: Acerca o aleja el lienzo en incrementos de `10%`.
- **Umbral Binario / Binarización (`applyBinaryThreshold`)**: Función especializada para lectura de tickets térmicos. Recorre los píxeles del área recortada, calcula la luminancia ($0.299R + 0.587G + 0.114B$) y aplica un umbral de contraste (`128`) convirtiendo cada píxel a blanco puro (`255`) o negro puro (`0`). Esto elimina sombras, manchas de papel térmico e iluminación despareja.
- **Restablecer (`reset`)**: Revierte todas las transformaciones y binarizaciones, restaurando la fotografía original capturada.
- **Aceptar (`confirmEdit`)**: Exporta la imagen recortada y optimizada y la agrega a la bandeja de vouchers pendientes.

---

## 4. Drawer de Detalle, OCR e Inteligencia Artificial (`<app-file-detail>`)

Al seleccionar un voucher pendiente o un nodo del árbol, se abre un panel deslizable lateral (*Drawer*) con un diseño de dos columnas: a la izquierda los datos estructurados del comprobante y a la derecha el lienzo interactivo `<canvas>` con la imagen del ticket.

### 4.1. Botón "Leer" — Reconocimiento Óptico de Caracteres (`OcrService` + `VouchersParserService`)
Al pulsar el botón **"Leer"**:
1. **Ejecución de Tesseract.js**: Se invoca `OcrService.recognizeImage()`, que inicializa un *worker* de `tesseract.js` configurado en idioma español (`spa`). Durante el proceso se muestra una barra de progreso porcentual en tiempo real.
2. **Detección Visual en el Lienzo (`<canvas>`)**: Una vez completado el reconocimiento, el componente superpone **recuadros verdes** (`strokeStyle = '#00FF00'`) sobre cada palabra detectada en la imagen cuya confianza estadística sea superior al 60% (`word.confidence > 60`).
3. **Extracción por Expresiones Regulares (`VouchersParserService`)**: El texto crudo reconocido es analizado automáticamente mediante patrones regulares para identificar y poblar en pantalla:
   - **CUIT**: Formato `XX-XXXXXXXX-X`.
   - **Fecha**: Formatos `DD/MM/YYYY` o `DD-MM-YYYY`.
   - **Monto Total**: Importes precedidos por `TOTAL`, `IMPORTE`, `NETO`, `PAGO` o símbolo `$`.
   - **Número de Tarjeta**: Últimos 4 dígitos de la tarjeta utilizada.
   - **Comercio**: Primera línea significativa del encabezado del ticket.

### 4.2. Botón "Analizar" — Estructuración Inteligente con IA (`AiService`)
Una vez que el comprobante cuenta con texto extraído por OCR, se habilita el botón **"Analizar"**:
1. **Envío al Modelo de Lenguaje**: El componente invoca `AiService.analyzeOcrText()`, enviando el texto crudo del OCR al modelo **`qwen/qwen3-4b:free`** (a través de OpenRouter) con un *prompt* especializado en análisis contable de tickets y facturas.
2. **Estructuración JSON Completa**: La IA interpreta el contexto semántico del ticket (incluso si el papel estaba arrugado o con errores tipográficos de OCR) y devuelve un objeto JSON normalizado con la siguiente estructura:
   - `comercio`: Nombre del comercio o tienda.
   - `fecha`: Fecha en formato `YYYY-MM-DD`.
   - `hora`: Hora de la operación en formato `HH:MM`.
   - `monto_total`: Valor numérico decimal del total abonado.
   - `moneda`: Símbolo o código de moneda (`$`, `ARS`, `USD`).
   - `cuit`: CUIT del emisor si está presente.
   - `nro_transaccion`: Número de ticket, factura o cupón de autorización.
   - `metodo_pago`: Medio de pago detectado (*Efectivo*, *Tarjeta de Crédito*, *Débito*, etc.).
   - `items`: Arreglo detallado de productos o conceptos adquiridos (`descripcion`, `cantidad`, `precio_unitario`, `subtotal`).
3. **Persistencia Automática**: Los datos estructurados por la IA actualizan la vista de detalle y se guardan automáticamente en el registro del voucher pendiente mediante `PendingVouchersService.updateVoucher()`.

---

## 5. Visores Auxiliares de Documentos (`<app-pdf-viewer>` y `<app-iframe-viewer>`)

Para documentos que no son imágenes fotográficas sino archivos digitales o enlaces externos, el módulo dispone de dos componentes embebidos:
- **Visor de PDF (`<app-pdf-viewer>`)**: Basado en `ng2-pdf-viewer`, permite renderizar documentos PDF multipágina directamente en la interfaz sin descargar el archivo ni abandonar la pantalla.
- **Visor Iframe (`<app-iframe-viewer>`)**: Sanitiza URLs seguras mediante `DomSanitizer` (`bypassSecurityTrustResourceUrl`) para previsualizar comprobantes electrónicos alojados en portales externos.
