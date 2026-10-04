export abstract class BaseSchema {
  /**
   * Creation date of the entity.
   * Automatically generated when the entity is created.
   */
  createdAt: Date;

  /**
   * Last update date of the entity.
   * Automatically updated when the entity is modified.
   */
  updatedAt: Date;
}
