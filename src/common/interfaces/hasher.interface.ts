export interface IHasher {
  /**
   * Generate a hash from a plain value
   */
  hash(value: string): Promise<string>;

  /**
   * Compare a plain value with its hashed counterpart
   */
  compare(value: string, hashed: string): Promise<boolean>;
}
