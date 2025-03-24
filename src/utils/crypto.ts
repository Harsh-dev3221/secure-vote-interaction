
import CryptoJS from 'crypto-js';

// Secret key for AES encryption (in a real app, this would be an environment variable)
const SECRET_KEY = 'secure-voting-system-secret-key';

export const encryptAES = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptAES = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Hash password using SHA-256 (for storage comparison)
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

// Verify admin credentials with AES-256 and SHA-256
export const verifyAdminCredentials = (username: string, password: string): boolean => {
  // In a real application, these would be stored in a database
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD_HASH = CryptoJS.SHA256('admin123').toString();
  
  return username === ADMIN_USERNAME && CryptoJS.SHA256(password).toString() === ADMIN_PASSWORD_HASH;
};
