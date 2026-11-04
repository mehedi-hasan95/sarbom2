import { DrizzleQueryError } from "drizzle-orm/errors";

// type PgError = Error & {
//   code: string;
//   constraint?: string;
//   detail?: string;
// };

// const isPgError = (e: unknown): e is PgError =>
//   e instanceof Error && "code" in e && typeof e.code === "string";

// export const getPgError = (error: unknown): PgError | null => {
//   const source = error instanceof DrizzleQueryError ? error.cause : error;
//   return isPgError(source) ? source : null;
// };

type PgError = {
  code: string;
  constraint?: string;
  detail?: string;
  message?: string;
};

export const getPgError = (error: unknown): PgError | null => {
  let current: unknown = error;

  while (current instanceof Error) {
    if ("code" in current && typeof current.code === "string") {
      return current as PgError;
    }

    current = current.cause;
  }

  return null;
};

const UNIQUE_VIOLATION_MESSAGES: Record<string, string> = {
  products_slug_key:
    "A product with this slug already exists. Please use a different slug.",
  product_colors_pkey: "This color has already been added to the product.",
  product_variants_sku_key:
    "This SKU is already in use. Please enter a unique SKU.",
  product_sizes_unique: "Size ID already exist",
};

export function getUniqueErrorMessage(constraint?: string) {
  return (
    (constraint && UNIQUE_VIOLATION_MESSAGES[constraint]) ??
    "A record with these details already exists."
  );
}
