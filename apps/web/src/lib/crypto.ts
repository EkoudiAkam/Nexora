import crypto from 'crypto';
import argon2 from 'argon2';

const MASTER_KEY_HEX = process.env.ENCRYPTION_MASTER_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const MASTER_KEY = Buffer.from(MASTER_KEY_HEX, 'hex');

// ==========================================
// 1. Hachage des Mots de Passe (Argon2id)
// ==========================================
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

// ==========================================
// 2. Chiffrement Réversible (AES-256-GCM)
// ==========================================
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export interface EncryptedPayload {
  iv: string;
  tag: string;
  data: string;
}

export function encryptSecret(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  const payload: EncryptedPayload = {
    iv: iv.toString('hex'),
    tag: authTag.toString('hex'),
    data: encrypted,
  };
  
  return JSON.stringify(payload);
}

export function decryptSecret(encryptedJson: string): string {
  const payload: EncryptedPayload = JSON.parse(encryptedJson);
  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.tag, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(payload.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
