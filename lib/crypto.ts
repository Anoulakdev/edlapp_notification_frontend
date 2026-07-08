import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'edl-secret-key-2026';

export const encryptId = (id: string | number): string => {
  return encodeURIComponent(CryptoJS.AES.encrypt(id.toString(), SECRET_KEY).toString());
};

export const decryptId = (encryptedId: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedId), SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt ID', error);
    return '';
  }
};
