export interface DocumentInterface {
  id: string;
  path: string;        // base64 con o sin prefijo
  name: string;    // opcional, para detectar extensión
  status: string;
}
