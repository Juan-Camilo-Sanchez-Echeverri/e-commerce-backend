import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          const valueTRim = value.replace(/ /g, '');
          if (valueTRim === '') return false;
          return true;
        },
        defaultMessage() {
          return `${propertyName} should not be empty and is string`;
        },
      },
    });
  };
}
