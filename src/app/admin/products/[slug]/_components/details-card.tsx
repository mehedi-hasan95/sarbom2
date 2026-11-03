"use client";

import { FieldGroup } from "@/components/ui/field";

import { useFormContext } from "react-hook-form";
import { InputController } from "@/components/form/input-controller";
import { TextareaController } from "@/components/form/textarea-controller";
import { slugify } from "@/lib/utils";
import { SwitchController } from "@/components/form/switch-controller";
import { ModifyCard } from "./modify-card";
import z from "zod";
import { productValidator } from "@/zod-validator/product-validator";

export const DetailsCard = () => {
  const { control, setValue, formState } =
    useFormContext<z.infer<typeof productValidator>>();
  return (
    <ModifyCard
      title="Product details"
      description="What customers see on the product page."
    >
      <FieldGroup>
        <InputController
          control={control}
          name="name"
          title="Name"
          placeholder="Classic tee"
          onChange={(value) => {
            if (!formState.dirtyFields.slug) {
              setValue("slug", slugify(value), {
                shouldValidate: formState.isSubmitted,
              });
            }
          }}
        />

        <InputController
          control={control}
          name="slug"
          title="Slug"
          placeholder="classic-tee"
        />

        <div className="grid md:grid-cols-2 gap-5">
          <InputController
            control={control}
            name="price"
            title="Price"
            placeholder="e.g. 20.00"
          />

          <InputController
            control={control}
            name="salePrice"
            title="Sale Price"
            placeholder="e.g. 20.00"
          />
        </div>

        <TextareaController
          control={control}
          name="shortDesc"
          placeholder="A soft, midnight cotton tee that holds its shape."
          title="Short Description"
          maxNumber={200}
        />

        <TextareaController control={control} name="description" />
      </FieldGroup>
    </ModifyCard>
  );
};
