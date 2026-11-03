import {
  boolean,
  index,
  jsonb,
  numeric,
  pgEnum,
  serial,
  snakeCase,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./schema.helper";
import { sql } from "drizzle-orm";
import { SPECIFICATION } from "@/zod-validator/type";

export const categories = snakeCase.table(
  "categories",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    ...timestamps,
  },
  (t) => [index("category_slug_idx").on(t.slug)],
);

export const subCategories = snakeCase.table(
  "sub_categories",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    catSlug: text()
      .notNull()
      .references(() => categories.slug, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    ...timestamps,
  },
  (t) => [index("sub_categories_slug_idx").on(t.catSlug)],
);

export const productStatus = pgEnum("product_status", ["active", "inactive"]);

export const products = snakeCase.table(
  "products",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    shortDesc: varchar({ length: 200 }).notNull(),
    description: text().notNull(),
    specification: jsonb().$type<SPECIFICATION>(),
    thumbnail: text().references(() => images.url, { onDelete: "cascade" }),
    price: numeric({ precision: 12, scale: 2 }),
    categorySlug: text()
      .notNull()
      .references(() => categories.slug, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    subCategorySlug: text()
      .notNull()
      .references(() => subCategories.slug, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    status: productStatus().notNull().default("inactive"),
    isVariant: boolean().default(false),
    ...timestamps,
    deletedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index("products_category_idx").on(t.categorySlug),
    index("products_sub_category_idx").on(t.subCategorySlug),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Sizes (price lives here)                                                  */
/*  size = null means the product has no size options                         */
/* -------------------------------------------------------------------------- */

export const productSizes = snakeCase.table(
  "product_sizes",
  {
    id: uuid().primaryKey().defaultRandom(),
    productSlug: text()
      .notNull()
      .references(() => products.slug, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    size: text(), // "S", "M", "XL" or null
    compareAtPrice: numeric({ precision: 12, scale: 2 }),
  },
  (t) => [
    unique("product_sizes_unique").on(t.productSlug, t.size).nullsNotDistinct(),
    index("product_sizes_product_idx").on(t.productSlug),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Colors (appearance + images, stored once per product color)               */
/*  hex = null means the product has no color options                         */
/* -------------------------------------------------------------------------- */

export const productColors = snakeCase.table(
  "product_colors",
  {
    id: uuid().primaryKey().defaultRandom(),
    productSlug: text()
      .notNull()
      .references(() => products.slug, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: text(), // "Midnight Blue"
    hex: text(), // "#191970" or null
    images: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
  },
  (t) => [
    unique("product_colors_unique").on(t.productSlug, t.hex).nullsNotDistinct(),
    index("product_colors_product_idx").on(t.productSlug),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Variants (the purchasable size x color combination)                       */
/*  This is what goes in the cart and what stock is tracked against           */
/* -------------------------------------------------------------------------- */

export const productVariants = snakeCase.table(
  "product_variants",
  {
    id: uuid().primaryKey().defaultRandom(),
    sizeId: uuid()
      .notNull()
      .references(() => productSizes.id, { onDelete: "cascade" }),
    colorId: uuid().references(() => productColors.id, {
      onDelete: "cascade",
    }), // null = product has no colors
    sku: text().unique(), // multiple nulls allowed in Postgres

    price: numeric({ precision: 12, scale: 2 }),
  },
  (t) => [
    unique("product_variants_unique")
      .on(t.sizeId, t.colorId)
      .nullsNotDistinct(),
    index("product_variants_size_idx").on(t.sizeId),
    index("product_variants_color_idx").on(t.colorId),
  ],
);

export const images = snakeCase.table(
  "images",
  {
    id: serial().primaryKey(),
    url: text().notNull().unique(),
    key: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("images_created_idx").on(t.createdAt)],
);
