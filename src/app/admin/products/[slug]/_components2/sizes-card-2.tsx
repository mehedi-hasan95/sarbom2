"use client";

import { ProductFormInput } from "@/zod-validator/product-validator";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ArrayError, emptyVariant } from "./create-product-form-2";
import { ModifyCard } from "../_components/modify-card";
import { SizeCard2 } from "./size-card-2";

export const SizesCard2 = () => {
  const { control, getValues, formState } = useFormContext<ProductFormInput>();
  const sizes = useFieldArray({ control, name: "sizes" });

  const isVariant = useWatch({ control, name: "isVariant" });

  function addSize() {
    const colors = getValues("colors");
    sizes.append({
      size: "",
      price: "",
      compareAtPrice: "",
      variants: colors.length
        ? colors.map((c) => emptyVariant(c.key))
        : [emptyVariant()],
    });
  }
  return (
    <ModifyCard
      title="Sizes, pricing and stock"
      description="Price is set per size. Each variant is one size and color you can
          sell, with its own SKU and stock."
    >
      <FieldGroup>
        {sizes.fields.map((size, i) => (
          <SizeCard2
            key={size.id}
            index={i}
            canRemove={sizes.fields.length > 1}
            onRemove={() => sizes.remove(i)}
          />
        ))}

        <ArrayError error={formState.errors.sizes} />

        {isVariant && (
          <div>
            <Button type="button" variant="outline" size="sm" onClick={addSize}>
              <Plus aria-hidden /> Add size
            </Button>
          </div>
        )}
      </FieldGroup>
    </ModifyCard>
  );
};
