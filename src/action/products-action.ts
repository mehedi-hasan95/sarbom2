"use server";

import { db } from "@/db";
import {
  productColors,
  products,
  productSizes,
  productVariants,
} from "@/db/index.schema";
import { getPgError } from "@/utils/error-handler";
import {
  productFormSchema,
  ProductFormValues,
} from "@/zod-validator/product-validator";

export const createProductAction = async (values: ProductFormValues) => {
  try {
    const validateData = productFormSchema.safeParse(values);
    if (!validateData.success) {
      return { error: "Invalid payload" };
    }

    const {
      categorySlug,
      colors,
      description,
      name,
      shortDesc,
      sizes,
      slug,
      subCategorySlug,
      isVariant,
      specification,
      status,
    } = validateData.data;

    const data = await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          categorySlug,
          description,
          name,
          shortDesc,
          slug,
          subCategorySlug,
          isVariant,
          specification,
          status,
        })
        .returning();

      // // 1 Insert sizes
      // const sizePrices = sizes.map(({ size, price, compareAtPrice }) => ({
      //   size,
      //   price,
      //   compareAtPrice,
      //   productSlug: product.slug,
      // }));
      // const createdSizes = await tx
      //   .insert(productSizes)
      //   .values(sizePrices)
      //   .returning();

      // // 2 insert colors
      // const productColor = colors.map(({ hex, images, key, name }) => ({
      //   hex,
      //   images,
      //   id: key,
      //   name,
      //   productSlug: slug,
      // }));
      // await tx.insert(productColors).values(productColor).returning();

      // // 3. Map variants with their corresponding size IDs
      // const sizeVariants = sizes.flatMap((size, index) =>
      //   size.variants.map((variant) => ({
      //     sku: variant.sku,
      //     colorId: variant.colorKey,
      //     sizeId: createdSizes[index].id,
      //   })),
      // );

      // // 5. Insert variants
      // if (sizeVariants.length > 0) {
      //   await tx.insert(productVariants).values(sizeVariants);
      // }
      return { product };
    });
    return { data: data.product };
  } catch (error) {
    const pgError = getPgError(error);

    if (pgError?.code === "23505") {
      return { error: "A product with this slug already exists" };
    }
    return { error: "Something went wrong" };
  }
};
