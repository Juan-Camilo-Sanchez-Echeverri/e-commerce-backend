import { BadRequestException, Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';
import { INVALID_BASE64 } from './constants';
import { genSalt, hash, compare } from 'bcrypt';

@Injectable()
export class EncoderService {
  static async encodePassword(password: string) {
    const salt = await genSalt(10);
    return await hash(password, salt);
  }

  static async checkPassword(password: string, userPassword: string) {
    if (!userPassword) return false;

    return await compare(password, userPassword);
  }

  encryptData(data: any, secretKey: string): string {
    const key = this.generatePasswordEncryptDecrypt(secretKey);
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    const ivBase64 = this.transformBytesInBase64(iv);
    const authTagBase64 = this.transformBytesInBase64(authTag);

    return `${ivBase64}:${authTagBase64}:${encrypted}`;
  }

  decryptData<T = unknown>(encryptedData: string, secretKey: string): T {
    const [iv, authTag, data] = encryptedData.split(':');

    const key = this.generatePasswordEncryptDecrypt(secretKey);
    const ivBuffer = this.transformBase64ToBytes(iv);
    const authTagBuffer = this.transformBase64ToBytes(authTag);
    const decipher = createDecipheriv('aes-256-gcm', key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted) as T;
  }

  private isValidBase64(str: string): boolean {
    const base64Regex =
      /^(?:[A-Z0-9+\\/]{4})*(?:[A-Z0-9+\\/]{2}==|[A-Z0-9+\\/]{3}=)?$/i;
    return base64Regex.test(str);
  }

  private transformBase64ToBytes(base64: string): Buffer {
    const isValidBase64 = this.isValidBase64(base64);
    if (!isValidBase64) throw new BadRequestException(INVALID_BASE64);

    return Buffer.from(base64, 'base64');
  }

  private generatePasswordEncryptDecrypt(value: string): Buffer {
    return createHash('sha256').update(value).digest();
  }

  private transformBytesInBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }
}
