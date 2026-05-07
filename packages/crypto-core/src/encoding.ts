export function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function bytesToBase64(bytes: Uint8Array): string {
  // Convert Uint8Array to binary string
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  // Encode binary string to Base64
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  // Decode Base64 to binary string
  const binary = atob(base64);
  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
