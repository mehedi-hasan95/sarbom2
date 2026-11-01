"use server";

import { db } from "@/db";
import { productColors, products } from "@/db/index.schema";
import { getPgError } from "@/utils/error-handler";
import { productValidator2 } from "@/zod-validator/product-validator2";
import z from "zod";

export const createProductAction = async (
  values: z.infer<typeof productValidator2>,
) => {
  try {
    const validateData = productValidator2.safeParse(values);
    if (!validateData.success) {
      return { error: "Invalid payload" };
    }

    const {
      categorySlug,
      description,
      isVariant,
      name,
      shortDesc,
      slug,
      status,
      subCategorySlug,
      specification,
      colors,
    } = validateData.data;
    const data = await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          categorySlug,
          description,
          isVariant,
          name,
          shortDesc,
          slug,
          status,
          subCategorySlug,
          specification,
        })
        .returning();

      // 1. Add colors
      const productColor = colors.map(({ id, images, hex, name }) => ({
        id,
        images,
        hex,
        name,
        productSlug: product.slug,
      }));
      await tx.insert(productColors).values(productColor).returning();
      return { data: product };
    });

    return { data: validateData.data };
  } catch (error) {
    const pgError = getPgError(error);

    if (pgError?.code === "23505") {
      return { error: "A product with this slug already exists" };
    }
    return { error: "Something went wrong" };
  }
};
