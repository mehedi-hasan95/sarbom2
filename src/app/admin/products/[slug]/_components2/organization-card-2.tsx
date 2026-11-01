"use client";

import { FieldGroup } from "@/components/ui/field";
import { useFormContext, useWatch } from "react-hook-form";
import { ComboboxController } from "@/components/form/combobox-controller";
import { useGetCategories } from "@/hooks/categories/use-categories";
import { useQuery } from "@tanstack/react-query";
import { getSubCategoriesOptions } from "@/transtack-options/category-data";
import { ModifyCard } from "../_components/modify-card";
import z from "zod";
import { productValidator2 } from "@/zod-validator/product-validator2";

export const OrganizationCard2 = () => {
  const { control } = useFormContext<z.infer<typeof productValidator2>>();
  const categorySlug = useWatch({ control, name: "categorySlug" });
  const { data: categories } = useGetCategories();
  const { data: subCategories } = useQuery(
    getSubCategoriesOptions(categorySlug),
  );
  return (
    <ModifyCard title="Organization">
      <FieldGroup>
        <ComboboxController
          control={control}
          name="status"
          options={[
            { label: "Inactive", value: "inactive" },
            { label: "Active", value: "active" },
          ]}
          title="Status"
          placeholder="Select Status"
        />

        <ComboboxController
          control={control}
          name="categorySlug"
          options={categories.map((item) => ({
            label: item.name,
            value: item.slug,
          }))}
          title="Category"
          placeholder="Select Category"
        />

        <ComboboxController
          control={control}
          name="subCategorySlug"
          options={
            subCategories?.data.map((item) => ({
              label: item.name,
              value: item.slug,
            })) ?? []
          }
          title="Category"
          placeholder="Select Category"
          disabled={!categorySlug}
        />
      </FieldGroup>
    </ModifyCard>
  );
};
