import { registerDecorator, ValidationOptions } from 'class-validator';

const message = `Password must be 8-20 characters,including uppercase, lowercase, digits, and special characters.`;

export function IsPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPassword',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          // Requerimientos para una contraseña segura
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasDigits = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          const isLengthValid = value.length >= 8 && value.length <= 20;

          return (
            hasUpperCase &&
            hasLowerCase &&
            hasDigits &&
            hasSpecialChar &&
            isLengthValid
          );
        },
        defaultMessage() {
          return message;
        },
      },
    });
  };
}
