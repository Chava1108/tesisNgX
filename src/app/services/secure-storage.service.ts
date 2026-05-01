import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  // Clave de cifrado AES (en producción usar variable de entorno)
  private readonly SECRET_KEY = 'P00Gr4ph_UAA_2026_S3cur3!';

  setItem(key: string, value: any): void {
    const str = value == null ? '' : String(value);
    const encrypted = CryptoJS.AES.encrypt(str, this.SECRET_KEY).toString();
    sessionStorage.setItem(key, encrypted);
  }

  getItem(key: string): string | null {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }
}
