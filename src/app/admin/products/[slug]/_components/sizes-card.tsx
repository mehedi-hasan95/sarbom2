"use client";

import { useState } from "react";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import z from "zod";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { productValidator } from "@/zod-validator/product-validator";

import { ArrayError, emptyVariant } from "./create-product-form";

import { ModifyCard } from "./modify-card";
import { SizeCard } from "./size-card";
import { BulkApplyField } from "./bulk-apply-field";

type BulkValues = {
  price?: string;
  salePrice?: string;
  stock?: string;
};

export const SizesCard = () => {
  const { control, getValues, formState } =
    useFormContext<z.input<typeof productValidator>>();

  const sizes = useFieldArray({
    control,
    name: "sizes",
  });

  const isVariant = useWatch({
    control,
    name: "isVariant",
  });

  // Temporary values. Not included in submitted form data.
  const [bulkValues, setBulkValues] = useState<BulkValues>({});

  function handleBulkApply(field: string, value: string) {
    setBulkValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function addSize() {
    const id = crypto.randomUUID();
    const colors = getValues("colors");

    const variants = colors.length
      ? colors.map((color) =>
          emptyVariant({
            colorId: color.id,
            sizeId: id,
          }),
        )
      : [
          emptyVariant({
            sizeId: id,
          }),
        ];

    sizes.append({
      id,
      size: "",
      variants: variants.map((variant) => ({
        ...variant,
        ...(bulkValues.price !== undefined && {
          price: bulkValues.price,
        }),
        ...(bulkValues.salePrice !== undefined && {
          salePrice: bulkValues.salePrice,
        }),
        ...(bulkValues.stock !== undefined && {
          stock: bulkValues.stock,
        }),
      })),
    });
  }

  return (
    <ModifyCard
      title="Sizes, pricing and stock"
      description="Price is set per size. Each variant is one size and color you can sell, with its own SKU and stock."
    >
      <div className="space-y-4">
        {isVariant && (
          <BulkApplyField
            control={control}
            name="sizes"
            title="Bulk update variants"
            description="Choose a field and apply the same value to all sizes and colors."
            fields={[
              {
                label: "Regular price",
                value: "price",
                placeholder: "e.g. 25.00",
                step: "0.01",
              },
              {
                label: "Sale price",
                value: "salePrice",
                placeholder: "e.g. 20.00",
                step: "0.01",
              },
              {
                label: "Product stock",
                value: "stock",
                placeholder: "e.g. 100",
                step: "1",
              },
            ]}
            onApply={handleBulkApply}
          />
        )}

        {sizes.fields.map((size, i) => (
          <SizeCard
            key={size.id}
            index={i}
            canRemove={sizes.fields.length > 1}
            onRemove={() => sizes.remove(i)}
            bulkValues={bulkValues}
          />
        ))}

        <ArrayError error={formState.errors.sizes} />

        {isVariant && (
          <div>
            <Button type="button" variant="outline" size="sm" onClick={addSize}>
              <Plus aria-hidden />
              Add size
            </Button>
          </div>
        )}
      </div>
    </ModifyCard>
  );
};
