"use client";

import { useFormContext } from "react-hook-form";
import z from "zod";
import { productValidator } from "@/zod-validator/product-validator";
import { ModifyCard } from "./modify-card";
import { SwitchController } from "@/components/form/switch-controller";

export const VariantCard = () => {
  const { control } = useFormContext<z.infer<typeof productValidator>>();
  return (
    <ModifyCard title="Product Variation">
      <SwitchController
        control={control}
        name="isVariant"
        title="Is this variant product?"
      />
    </ModifyCard>
  );
};
