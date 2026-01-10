export type ValidationCondition = {
  id: string;
  value?: any;
  answered?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

export function isAnswered(value: any): boolean {
  return value !== undefined && value !== null && value !== "";
}

export function validateRequired(value: any): boolean {
  return isAnswered(value);
}

export function validateMinLength(value: any, minLength: number): boolean {
  return typeof value === "string" && value.length >= minLength;
}

export function validateMaxLength(value: any, maxLength: number): boolean {
  return typeof value === "string" && value.length <= maxLength;
}

export function validatePattern(value: any, pattern: string): boolean {
  if (typeof value !== "string") return false;
  const regex = new RegExp("^" + pattern + "$");
  return regex.test(value);
}

export function validateValueMatch(value: any, expectedValue: any): boolean {
  if (Array.isArray(expectedValue)) {
    return Array.isArray(value) && expectedValue.every((cv) => value.includes(cv));
  }
  return value === expectedValue;
}

export function satisfiesConditions(
  conditions: ValidationCondition[] | undefined,
  validationState: Record<string, any>
): boolean {
  if (!conditions || conditions.length === 0) return true;
  
  return conditions.every((condition) => {
    const value = validationState[condition.id];
    
    if (condition.answered !== undefined) {
      return isAnswered(value);
    }
    
    if (condition.required !== undefined && condition.required) {
      if (!validateRequired(value)) return false;
    }
    
    if (condition.minLength !== undefined) {
      if (!validateMinLength(value, condition.minLength)) return false;
    }
    
    if (condition.maxLength !== undefined) {
      if (!validateMaxLength(value, condition.maxLength)) return false;
    }
    
    if (condition.pattern !== undefined) {
      if (!validatePattern(value, condition.pattern)) return false;
    }
    
    if (condition.value !== undefined) {
      return validateValueMatch(value, condition.value);
    }
    
    return true;
  });
}
