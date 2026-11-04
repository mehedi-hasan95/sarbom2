"use server";

import { db } from "@/db";
import {
  productColors,
  products,
  productSizes,
  productVariants,
} from "@/db/index.schema";
import { getSession } from "@/lib/get-session";
import { getPgError, getUniqueErrorMessage } from "@/utils/error-handler";
import { productValidator } from "@/zod-validator/product-validator";
import z from "zod";

export const createProductAction = async (
  values: z.input<typeof productValidator>,
) => {
  try {
    const validateData = productValidator.safeParse(values);
    if (!validateData.success) {
      return { error: "Invalid payload" };
    }

    // const user = await getSession();
    // if (!user || user.role !== "admin") {
    //   return { error: "Unauthorized" };
    // }

    const {
      categorySlug,
      colors,
      description,
      isVariant,
      name,
      price,
      sizes,
      slug,
      status,
      subCategorySlug,
      salePrice,
      shortDesc,
      specification,
      tags,
      thumbnail,
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
          tags,
          thumbnail,
          price,
          salePrice,
        })
        .returning();

      // 02 Product colors
      const addColors = colors.map((item) => ({
        name: item.name,
        hex: item.hex,
        images: item.images,
        id: item.id,
        productSlug: product.slug,
      }));
      await tx.insert(productColors).values(addColors).returning();

      // 03 Product sizes
      const addSizes = sizes.map((item) => ({
        productSlug: product.slug,
        size: item.size,
        id: item.id,
      }));
      await tx.insert(productSizes).values(addSizes);

      // 04 Product Variants
      const getVariants = sizes.flatMap((item) => item.variants);
      const addVariants = getVariants.map((item) => ({
        sizeId: item.sizeId!,
        colorId: item.colorId,
        sku: item.sku,
        price: item.price,
        salePrice: item.salePrice,
        stock: item.stock,
      }));
      await tx.insert(productVariants).values(addVariants);
      return { product };
    });

    return { data: data.product };
  } catch (error) {
    const pgError = getPgError(error);
    if (pgError?.code === "23505") {
      return { error: getUniqueErrorMessage(pgError.constraint) };
    }
    return { error: "Something went wrong. Please try again." };
  }
};
