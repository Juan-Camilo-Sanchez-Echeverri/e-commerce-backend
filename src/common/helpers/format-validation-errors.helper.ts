import { ValidationError } from 'class-validator';

export const getClassValidatorErrors = (
  validationErrors: ValidationError[],
  parentProperty = '',
): Array<{ property: string; errors: string[] }> => {
  const errors: { property: string; errors: string[] }[] = [];
  getValidationErrorsRecursively(validationErrors, errors, parentProperty);
  return errors;
};

const getValidationErrorsRecursively = (
  validationErrors: ValidationError[],
  errors: { property: string; errors: string[] }[],
  parentProperty = '',
) => {
  for (const error of validationErrors) {
    const propertyPath = parentProperty
      ? `${parentProperty}.${error.property}`
      : error.property;

    if (error.constraints) {
      errors.push({
        property: propertyPath,
        errors: Object.values(error.constraints),
      });
    }

    if (error.children?.length) {
      getValidationErrorsRecursively(error.children, errors, propertyPath);
    }
  }
};
