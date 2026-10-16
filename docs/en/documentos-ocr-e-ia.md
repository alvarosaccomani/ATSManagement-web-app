# User Manual: Digitization, Camera, OCR and AI

This document describes the complete workflow for image capture, preprocessing, Optical Character Recognition (OCR), and Artificial Intelligence structuring in the **Documents and Vouchers** module (`/admin/user/documents`).

---

## 1. Split-Screen Documents View (`/admin/user/documents`)

The document management screen is designed with a resizable two-panel split-screen interface:

### 1.1. Left Panel (30%): Scope Filter and Hierarchical Tree
- **Scope Selector (`selectedScopeUuid`)**: Filters cards and receipts associated with a specific financial context or displays **"All Scopes" (`ALL`)**.
- **Navigation Tree (`<app-tree-view>`)**: Dynamically builds a three-level hierarchy from registered cards:
  1. **Level 1 — Card**: Displays the masked card number and its description.
  2. **Level 2 — Period (`YYYY-MM`)**: Groups receipts by transaction year and month.
  3. **Level 3 — Receipt (Leaf)**: Represents each individual voucher with its transaction number and date. Clicking on a receipt opens the side panel (*Drawer*) with its details.

### 1.2. Right Panel (70%): File Upload, Camera, and Pending Vouchers
The upper half provides a split area for receipt entry:
- **File Upload (`nz-upload` Drag & Drop)**: Allows dragging or selecting receipt/voucher images from the device, converting them to Base64 and adding them to the pending tray.
- **`"Take Photo"` Button**: Launches the WebRTC camera component (`<app-camera>`) to photograph a physical receipt on the spot.

The lower half displays the **Pending Vouchers Grid (`pendingVouchers`)**, persisted locally via `PendingVouchersService`. Each card in the grid shows a thumbnail of the image and its current status:
- **Pending Read** (orange): Newly uploaded or photographed image.
- **Read** (blue): Image processed via OCR or AI with extracted text.
- **Saved** (green): Confirmed voucher.
From each thumbnail, the user can open the detail view (eye icon) or delete the draft (trash icon).

---

## 2. WebRTC Camera Capture (`<app-camera>`)

Pressing **"Take Photo"** opens the live photographic capture viewfinder:
1. **Camera Toggle (`toggleCamera`)**: Switches between the rear camera (`environment`, ideal for focusing on receipts on a table on mobile devices) and the front camera (`user`).
2. **Frame Capture (`takePhoto`)**: Freezes the current video stream frame onto a `<canvas>` at native sensor resolution and generates a Base64 PNG image.
3. **Preview and Confirmation**: After capturing the photo, the user can choose between:
   - **Confirm (`confirmPhoto`)**: Sends the captured photograph to the **Image Editor** for cropping and enhancement before saving.
   - **Retake (`retakePhoto`)**: Discards the current shot and reactivates the live camera.
   - **Cancel (`cancelCamera`)**: Stops the video stream and returns to the documents view.

---

## 3. Image Editor and OCR Preprocessing (`<app-image-editor>`)

Before storing a photograph taken with the camera, the `<app-image-editor>` component (powered by `Cropper.js`) allows optimizing the image to maximize OCR engine accuracy:

- **Interactive Cropping**: Freely adjustable frame to isolate only the printed area of the receipt or card slip, discarding noisy backgrounds.
- **Rotation (`rotateLeft` / `rotateRight`)**: Rotates the image in `-90°` or `+90°` increments.
- **Flipping (`flipHorizontal` / `flipVertical`)**: Flips the horizontal or vertical axis of the image.
- **Zoom (`zoomIn` / `zoomOut`)**: Zooms the canvas in or out in `10%` increments.
- **Binary Threshold / Binarization (`applyBinaryThreshold`)**: Specialized function for reading thermal receipts. It iterates through the pixels of the cropped area, calculates luminance ($0.299R + 0.587G + 0.114B$), and applies a contrast threshold (`128`), converting each pixel to pure white (`255`) or pure black (`0`). This removes shadows, thermal paper stains, and uneven lighting.
- **Reset (`reset`)**: Reverts all transformations and binarizations, restoring the original captured photograph.
- **Accept (`confirmEdit`)**: Exports the cropped and optimized image and adds it to the pending vouchers tray.

---

## 4. Detail Drawer, OCR, and Artificial Intelligence (`<app-file-detail>`)

Selecting a pending voucher or a tree node opens a side sliding panel (*Drawer*) with a two-column layout: on the left, the structured receipt data, and on the right, the interactive `<canvas>` with the receipt image.

### 4.1. "Read" Button — Optical Character Recognition (`OcrService` + `VouchersParserService`)
Pressing the **"Read"** button:
1. **Tesseract.js Execution**: Invokes `OcrService.recognizeImage()`, which initializes a `tesseract.js` worker configured for Spanish (`spa`). During the process, a real-time percentage progress bar is displayed.
2. **Visual Detection on Canvas (`<canvas>`)**: Once recognition completes, the component overlays **green bounding boxes** (`strokeStyle = '#00FF00'`) over every word detected in the image whose statistical confidence exceeds 60% (`word.confidence > 60`).
3. **Regular Expression Extraction (`VouchersParserService`)**: The raw recognized text is automatically parsed using regular expression patterns to identify and populate on screen:
   - **CUIT (Tax ID)**: Format `XX-XXXXXXXX-X`.
   - **Date**: Formats `DD/MM/YYYY` or `DD-MM-YYYY`.
   - **Total Amount**: Amounts preceded by `TOTAL`, `IMPORTE`, `NETO`, `PAGO`, or `$` symbol.
   - **Card Number**: Last 4 digits of the card used.
   - **Merchant**: First significant line of the receipt header.

### 4.2. "Analyze" Button — Intelligent AI Structuring (`AiService`)
Once the receipt has OCR-extracted text, the **"Analyze"** button becomes enabled:
1. **Language Model Request**: The component invokes `AiService.analyzeOcrText()`, sending the raw OCR text to the **`qwen/qwen3-4b:free`** model (via OpenRouter) with a specialized prompt for accounting analysis of receipts and invoices.
2. **Complete JSON Structuring**: The AI interprets the semantic context of the receipt (even if the paper was wrinkled or contained OCR typos) and returns a normalized JSON object with the following structure:
   - `comercio`: Merchant or store name.
   - `fecha`: Date in `YYYY-MM-DD` format.
   - `hora`: Operation time in `HH:MM` format.
   - `monto_total`: Decimal numeric value of the total paid.
   - `moneda`: Currency symbol or code (`$`, `ARS`, `USD`).
   - `cuit`: Issuer Tax ID (CUIT) if present.
   - `nro_transaccion`: Receipt, invoice, or authorization coupon number.
   - `metodo_pago`: Detected payment method (*Cash*, *Credit Card*, *Debit*, etc.).
   - `items`: Detailed array of purchased products or concepts (`descripcion`, `cantidad`, `precio_unitario`, `subtotal`).
3. **Automatic Persistence**: The AI-structured data updates the detail view and is automatically saved to the pending voucher record via `PendingVouchersService.updateVoucher()`.

---

## 5. Auxiliary Document Viewers (`<app-pdf-viewer>` and `<app-iframe-viewer>`)

For documents that are digital files or external links rather than photographic images, the module provides two embedded components:
- **PDF Viewer (`<app-pdf-viewer>`)**: Powered by `ng2-pdf-viewer`, renders multi-page PDF documents directly within the interface without downloading the file or leaving the screen.
- **Iframe Viewer (`<app-iframe-viewer>`)**: Sanitizes trusted URLs via `DomSanitizer` (`bypassSecurityTrustResourceUrl`) to preview electronic receipts hosted on external portals.
