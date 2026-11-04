"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { FieldGroup } from "@/components/ui/field";
import { InputController } from "@/components/form/input-controller";
import { ImageUploadController } from "@/components/form/image-upload-controller";
import z from "zod";
import { productValidator } from "@/zod-validator/product-validator";
import { emptyVariant } from "./create-product-form";
import { ModifyCard } from "./modify-card";
import { ColorComboboxController } from "@/components/form/color-combobox-controller";
import { colorOptions } from "@/constants/color-size";

export const ColorsCard = () => {
  const { control, getValues, setValue } =
    useFormContext<z.input<typeof productValidator>>();
  const colors = useFieldArray({ control, name: "colors" });

  const isVariant = useWatch({ control, name: "isVariant" });

  function addColor() {
    const id = crypto.randomUUID();
    const hadColors = getValues("colors").length > 0;

    // read sizes BEFORE appending so we work from the current values
    const sizes = getValues("sizes");

    colors.append({ id, name: "", hex: "", images: [] });

    sizes.forEach((size, si) => {
      const only = size.variants[0];
      const isPlaceholder =
        !hadColors &&
        size.variants.length === 1 &&
        !!only &&
        only.colorId === null;

      // always replace the whole variants array so the nested
      // useFieldArray in SizeCard gets notified
      const variants = isPlaceholder
        ? [{ ...only, colorId: id, sizeId: size.id }]
        : [...size.variants, emptyVariant({ colorId: id, sizeId: size.id })];

      setValue(`sizes.${si}.variants`, variants, {
        shouldDirty: true,
        shouldTouch: true,
      });
    });
  }

  function removeColor(index: number) {
    // read the id from form values, not from `colors.fields`
    // (fields[i].id is RHF's generated key, not your UUID)
    const removedId = getValues(`colors.${index}.id`);
    if (!removedId) return;

    const remaining = getValues("colors").length - 1;
    const sizes = getValues("sizes");

    colors.remove(index);

    sizes.forEach((size, si) => {
      let next = size.variants.filter((v) => v.colorId !== removedId);
      if (next.length === 0 && remaining === 0) {
        next = [emptyVariant({ sizeId: size.id })];
      }
      setValue(`sizes.${si}.variants`, next, { shouldDirty: true });
    });
  }

  return (
    <ModifyCard
      title="Colors and images"
      description="Images belong to a color and are shared by every size. Skip this if
          the product comes in one color."
    >
      <FieldGroup>
        {colors.fields.map((color, i) => (
          <div key={color.id} className="space-y-4 rounded-lg border p-4">
            {isVariant && (
              <div className="flex items-start gap-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <InputController
                    name={`colors.${i}.name`}
                    control={control}
                    title="Color Name (optional)"
                    placeholder="Midnight blue"
                  />

                  <ColorComboboxController
                    name={`colors.${i}.hex`}
                    control={control}
                    options={colorOptions}
                    title="HEX"
                    placeholder="Select or create a hex code"
                  />
                </div>
                {colors.fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    aria-label={`Remove color ${i + 1}`}
                    onClick={() => removeColor(i)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                )}
              </div>
            )}

            <ImageUploadController
              control={control}
              endpoint="productImage"
              name={`colors.${i}.images`}
              maxImages={5}
              mode="multiple"
              title="Product Images"
            />
          </div>
        ))}

        {isVariant && (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addColor}
            >
              <Plus aria-hidden /> Add color
            </Button>
          </div>
        )}
      </FieldGroup>
    </ModifyCard>
  );
};
