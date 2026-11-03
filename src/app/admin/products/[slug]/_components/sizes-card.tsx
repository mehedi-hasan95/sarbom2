"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import z from "zod";
import { productValidator } from "@/zod-validator/product-validator";
import { ArrayError, emptyVariant } from "./create-product-form";
import { ModifyCard } from "./modify-card";
import { SizeCard } from "./size-card";

export const SizesCard = () => {
  const { control, getValues, formState } =
    useFormContext<z.input<typeof productValidator>>();
  const sizes = useFieldArray({ control, name: "sizes" });

  const isVariant = useWatch({ control, name: "isVariant" });

  const id = crypto.randomUUID();

  function addSize() {
    const colors = getValues("colors");
    sizes.append({
      id,
      size: "",
      variants: colors.length
        ? colors.map((c) => emptyVariant({ colorKey: c.id }))
        : [emptyVariant({})],
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
          <SizeCard
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
