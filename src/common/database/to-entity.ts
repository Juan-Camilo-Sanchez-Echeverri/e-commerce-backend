/**
 * Los DTOs de creación validan las referencias como `string` (`@IsMongoId()`),
 * mientras que los esquemas las tipan como `ObjectId` o `PopulatedEntity<T>`.
 * Mongoose castea esos valores al escribir, así que esta función deja explícita
 * esa conversión en el borde DTO -> entidad en lugar de repetir el cast.
 */
export function toEntity<T>(dto: object): Partial<T> {
  return dto;
}
