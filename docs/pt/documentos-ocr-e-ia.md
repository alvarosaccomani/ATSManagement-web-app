# Manual do Usuário: Digitalização, Câmera, OCR e IA

Este documento descreve o fluxo completo de captura, pré-processamento de imagens, reconhecimento óptico de caracteres (OCR) e estruturação por meio de Inteligência Artificial no módulo de **Documentos e Vouchers** (`/admin/user/documents`).

---

## 1. Visualização Dividida de Documentos (`/admin/user/documents`)

A tela de gestão documental foi projetada com uma interface dividida (*split-screen*) em dois painéis redimensionáveis:

### 1.1. Painel Esquerdo (30%): Filtro de Escopo e Árvore Hierárquica
- **Seletor de Escopo (`selectedScopeUuid`)**: Permite filtrar os cartões e comprovantes associados a um contexto financeiro específico ou visualizar **"Todos os Escopos" (`ALL`)**.
- **Árvore de Navegação (`<app-tree-view>`)**: Constrói dinamicamente uma hierarquia de três níveis a partir dos cartões cadastrados:
  1. **Nível 1 — Cartão**: Exibe o número mascarado do cartão e sua descrição.
  2. **Nível 2 — Período (`YYYY-MM`)**: Agrupa os comprovantes conforme o ano e mês da transação.
  3. **Nível 3 — Comprovante (Folha)**: Representa cada voucher individual com seu número de transação e data. Ao clicar sobre um comprovante, abre-se o painel lateral (*Drawer*) com seus detalhes.

### 1.2. Painel Direito (70%): Upload de Arquivos, Câmera e Vouchers Pendentes
Na metade superior dispõe de uma área dividida para entrada de comprovantes:
- **Upload de Arquivos (`nz-upload` Drag & Drop)**: Permite arrastar ou selecionar imagens de recibos/vouchers a partir do dispositivo, convertendo-as para Base64 e adicionando-as à bandeja de pendentes.
- **Botão `"Tirar Foto"`**: Inicia o componente de câmera WebRTC (`<app-camera>`) para fotografar um comprovante físico no momento.

Na metade inferior é exibida a **Grade de Vouchers Pendentes (`pendingVouchers`)**, persistida localmente via `PendingVouchersService`. Cada cartão na grade mostra uma miniatura da imagem e seu estado atual:
- **Pendente de leitura** (laranja): Imagem recém-carregada ou fotografada.
- **Lido** (azul): Imagem processada via OCR ou IA com texto extraído.
- **Salvo** (verde): Comprovante confirmado.
A partir de cada miniatura é possível abrir os detalhes (ícone de olho) ou excluir o rascunho (ícone de lixeira).

---

## 2. Captura com Câmera WebRTC (`<app-camera>`)

Ao pressionar **"Tirar Foto"**, abre-se o visor de captura fotográfica ao vivo:
1. **Alternância de Câmera (`toggleCamera`)**: Permite alternar entre a câmera traseira (`environment`, ideal para focar comprovantes sobre uma mesa em dispositivos móveis) e a câmera frontal (`user`).
2. **Captura de Quadro (`takePhoto`)**: Congela o quadro atual do fluxo de vídeo em um `<canvas>` na resolução nativa do sensor e gera uma imagem PNG em Base64.
3. **Pré-visualização e Confirmação**: Após capturar a foto, o usuário pode escolher entre:
   - **Confirmar (`confirmPhoto`)**: Envia a fotografia capturada para o **Editor de Imagem** para recorte e aprimoramento antes de salvá-la.
   - **Tentar novamente (`retakePhoto`)**: Descarta a captura atual e reativa a câmera ao vivo.
   - **Cancelar (`cancelCamera`)**: Interrompe o fluxo de vídeo e retorna à visualização de documentos.

---

## 3. Editor de Imagem e Pré-processamento OCR (`<app-image-editor>`)

Antes de armazenar uma fotografia tirada com a câmera, o componente `<app-image-editor>` (baseado em `Cropper.js`) permite otimizar a imagem para maximizar a precisão do motor de OCR:

- **Recorte Interativo**: Quadro ajustável livremente para isolar apenas a área impressa do recibo ou comprovante de cartão, descartando fundos com ruído.
- **Rotação (`rotateLeft` / `rotateRight`)**: Gira a imagem em incrementos de `-90°` ou `+90°`.
- **Espelhamento (`flipHorizontal` / `flipVertical`)**: Inverte o eixo horizontal ou vertical da imagem.
- **Zoom (`zoomIn` / `zoomOut`)**: Aproxima ou afasta a tela em incrementos de `10%`.
- **Limiar Binário / Binarização (`applyBinaryThreshold`)**: Função especializada para leitura de cupons térmicos. Percorre os pixels da área recortada, calcula a luminância ($0.299R + 0.587G + 0.114B$) e aplica um limiar de contraste (`128`), convertendo cada pixel para branco puro (`255`) ou preto puro (`0`). Isso elimina sombras, manchas de papel térmico e iluminação irregular.
- **Redefinir (`reset`)**: Reverte todas as transformações e binarizações, restaurando a fotografia original capturada.
- **Aceitar (`confirmEdit`)**: Exporta a imagem recortada e otimizada e a adiciona à bandeja de vouchers pendentes.

---

## 4. Drawer de Detalhes, OCR e Inteligência Artificial (`<app-file-detail>`)

Ao selecionar um voucher pendente ou um nó da árvore, abre-se um painel lateral deslizante (*Drawer*) com layout de duas colunas: à esquerda os dados estruturados do comprovante e à direita o `<canvas>` interativo com a imagem do recibo.

### 4.1. Botão "Ler" — Reconhecimento Óptico de Caracteres (`OcrService` + `VouchersParserService`)
Ao clicar no botão **"Ler"**:
1. **Execução do Tesseract.js**: Invoca-se `OcrService.recognizeImage()`, que inicializa um *worker* do `tesseract.js` configurado para o idioma espanhol (`spa`). Durante o processo, é exibida uma barra de progresso percentual em tempo real.
2. **Detecção Visual no Canvas (`<canvas>`)**: Uma vez concluído o reconhecimento, o componente sobrepõe **caixas delimitadoras verdes** (`strokeStyle = '#00FF00'`) sobre cada palavra detectada na imagem cuja confiança estatística seja superior a 60% (`word.confidence > 60`).
3. **Extração por Expressões Regulares (`VouchersParserService`)**: O texto bruto reconhecido é analisado automaticamente por meio de padrões de expressões regulares para identificar e preencher na tela:
   - **CUIT**: Formato `XX-XXXXXXXX-X`.
   - **Data**: Formatos `DD/MM/YYYY` ou `DD-MM-YYYY`.
   - **Valor Total**: Valores precedidos por `TOTAL`, `IMPORTE`, `NETO`, `PAGO` ou símbolo `$`.
   - **Número do Cartão**: Últimos 4 dígitos do cartão utilizado.
   - **Estabelecimento**: Primeira linha significativa do cabeçalho do recibo.

### 4.2. Botão "Analisar" — Estruturação Inteligente com IA (`AiService`)
Assim que o comprovante possui texto extraído por OCR, o botão **"Analisar"** é habilitado:
1. **Envio ao Modelo de Linguagem**: O componente invoca `AiService.analyzeOcrText()`, enviando o texto bruto do OCR para o modelo **`qwen/qwen3-4b:free`** (via OpenRouter) com um *prompt* especializado em análise contábil de recibos e faturas.
2. **Estruturação JSON Completa**: A IA interpreta o contexto semântico do comprovante (mesmo que o papel estivesse amassado ou com erros tipográficos de OCR) e retorna um objeto JSON normalizado com a seguinte estrutura:
   - `comercio`: Nome do estabelecimento ou loja.
   - `fecha`: Data no formato `YYYY-MM-DD`.
   - `hora`: Hora da operação no formato `HH:MM`.
   - `monto_total`: Valor numérico decimal do total pago.
   - `moneda`: Símbolo ou código da moeda (`$`, `ARS`, `USD`).
   - `cuit`: CUIT do emissor, se presente.
   - `nro_transaccion`: Número do recibo, fatura ou cupom de autorização.
   - `metodo_pago`: Meio de pagamento detectado (*Dinheiro*, *Cartão de Crédito*, *Débito*, etc.).
   - `items`: Lista detalhada de produtos ou itens adquiridos (`descripcion`, `cantidad`, `precio_unitario`, `subtotal`).
3. **Persistência Automática**: Os dados estruturados pela IA atualizam a visualização de detalhes e são salvos automaticamente no registro do voucher pendente via `PendingVouchersService.updateVoucher()`.

---

## 5. Visualizadores Auxiliares de Documentos (`<app-pdf-viewer>` e `<app-iframe-viewer>`)

Para documentos que não são imagens fotográficas, mas arquivos digitais ou links externos, o módulo dispõe de dois componentes embutidos:
- **Visualizador de PDF (`<app-pdf-viewer>`)**: Baseado em `ng2-pdf-viewer`, permite renderizar documentos PDF de múltiplas páginas diretamente na interface sem baixar o arquivo ou sair da tela.
- **Visualizador Iframe (`<app-iframe-viewer>`)**: Sanitiza URLs seguras via `DomSanitizer` (`bypassSecurityTrustResourceUrl`) para pré-visualizar comprovantes eletrônicos hospedados em portais externos.
