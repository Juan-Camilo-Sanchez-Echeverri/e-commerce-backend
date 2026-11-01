import { hash, compare } from 'bcrypt';

import { IHasher } from '../interfaces';

export class BcryptAdapter implements IHasher {
  constructor(private readonly rounds = 10) {}

  async hash(value: string): Promise<string> {
    return hash(value, this.rounds);
  }

  async compare(value: string, hashed: string): Promise<boolean> {
    return compare(value, hashed);
  }
}

export const bcryptAdapter = new BcryptAdapter();
