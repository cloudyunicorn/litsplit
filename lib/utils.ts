import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}

//errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === 'ZodError') {
    // Handle Zod error
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );

    return fieldErrors.join('. ');
  } else if (
    error.name === 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
}

export function serializeDecimal(value: unknown): string {
  if (typeof value === "object" && value !== null && "toString" in value) {
    return value.toString();
  }
  return String(value);
}

export function serializeRecord<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (isPrismaDecimal(value)) {
        // Convert Prisma.Decimal instances to strings
        return [key, value.toString()];
      }
      if (value instanceof Date) {
        // Convert Date instances to ISO strings
        return [key, value.toISOString()];
      }
      if (Array.isArray(value)) {
        // Recursively serialize each item in the array
        return [key, value.map((item) => serializeItem(item))];
      }
      if (typeof value === "object" && value !== null) {
        // Recursively serialize nested objects
        return [key, serializeRecord(value as Record<string, unknown>)];
      }
      // For primitives (string, number, boolean, null, undefined), return as is
      return [key, value];
    })
  ) as T;
}

// Helper function to serialize individual items
function serializeItem(value: unknown): unknown {
  if (isPrismaDecimal(value)) {
    return value.toString();
  }
  if (value instanceof Date) {
    return new Date(value).toLocaleDateString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeItem(item));
  }
  if (typeof value === "object" && value !== null) {
    return serializeRecord(value as Record<string, unknown>);
  }
  return value;
}

// Function to detect Prisma.Decimal instances without importing Prisma
function isPrismaDecimal(value: unknown): value is { toString: () => string } {
  return (
    typeof value === "object" &&
    value !== null &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as any).toString === "function" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as any).toNumber === "function" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as any).isInteger === "function" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as any).add === "function" // Prisma.Decimal has math methods
  );
}
