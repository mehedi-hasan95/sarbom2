import z from "zod";

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const HEX_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export const SIZE_REGEX = /^[A-Za-z0-9][A-Za-z0-9 ./-]{0,19}$/;
export const SKU_REGEX = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

export const productValidator = z
  .object({
    categorySlug: z.string().min(1),
    description: z.string().min(1),
    isVariant: z.boolean(),
    name: z.string().min(1),
    shortDesc: z.string().min(10).max(200),
    slug: z
      .string()
      .regex(SLUG_REGEX, "Lowercase letters, numbers and single hyphens only")
      .min(1),
    status: z.enum(["active", "inactive"]),
    subCategorySlug: z.string().min(1),
    thumbnail: z.string().optional(),
    price: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.coerce.number().nonnegative(),
    ),
    specification: z
      .array(
        z.object({
          key: z.string().trim().min(1, "Required").max(60),
          value: z.string().trim().min(1, "Required").max(200),
        }),
      )
      .max(30)
      .optional(),
    colors: z.array(
      z.object({
        name: z.string().optional(),
        hex: z
          .union([
            z.literal(""),
            z.string().trim().regex(HEX_REGEX, "Use a hex color like #191970"),
          ])
          .optional(),
        images: z
          .array(z.url())
          .min(1, "Add at least one image")
          .max(8, "Maximum 8 images per color"),
        id: z.uuid(),
      }),
    ),
    sizes: z.array(
      z.object({
        id: z.string(),
        size: z
          .union([
            z.literal(""),
            z
              .string()
              .trim()
              .regex(SIZE_REGEX, "Invalid size, e.g. S, XL, 42, 10.5"),
          ])
          .optional(),

        variants: z.array(
          z.object({
            sku: z.union([
              z.literal(""),
              z
                .string()
                .trim()
                .max(64, "SKU is too long")
                .regex(SKU_REGEX, "Use A-Z, 0-9 and hyphens, e.g. TEE-M-BLU"),
            ]),
            colorKey: z.string().min(1).nullable(),
            sizeKey: z.string().min(1).nullable(),
            price: z.preprocess((val) => {
              if (val === "" || val === null || val === undefined) {
                return undefined;
              }

              return val;
            }, z.coerce.number().nonnegative().optional()),
            // price: z.coerce.number().int().nonnegative().optional(),
            salePrice: z.coerce.number().int().nonnegative().optional(),
          }),
        ),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message });

    // 1. unique color hex (case-insensitive), ignoring empty hex values
    const seenHex = new Map<string, number>();

    data.colors.forEach((c, i) => {
      if (!c.hex) return;

      const hex = c.hex.toLowerCase();

      if (seenHex.has(hex)) {
        issue(["colors", i, "hex"], "Duplicate color");
      }

      seenHex.set(hex, i);
    });

    // 2. Require hex when product is a variant
    if (data.isVariant) {
      data.colors.forEach((c, i) => {
        if (!c.hex?.trim()) {
          issue(["colors", i, "hex"], "Hex color is required for variants");
        }
      });
      data.sizes.forEach((size, i) => {
        size.variants.forEach((variant, j) => {
          if (
            variant.price === undefined ||
            !Number.isFinite(variant.price) ||
            variant.price < 0
          ) {
            issue(
              ["sizes", i, "variants", j, "price"],
              "Variant price is required",
            );
          }
        });
      });
    }
    if (!data.isVariant) {
      if (
        data.price === undefined ||
        !Number.isFinite(data.price) ||
        data.price < 0
      ) {
        issue(["price"], "Price is required for variants");
      }
    }
  });
