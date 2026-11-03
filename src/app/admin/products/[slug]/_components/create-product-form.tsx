"use client";

import { productValidator } from "@/zod-validator/product-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { SpecificationCard } from "./specification-card";
import { OrganizationCard } from "./organization-card";
import { Field, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createProductAction } from "@/action/products-action-2";
import { LoadingButton } from "@/components/common/loading-button";
import { useEffect, useState } from "react";
import { ColorsCard } from "./colors-card";
import { SizesCard } from "./sizes-card";
import { DetailsCard } from "./details-card";
import { VariantCard } from "./variant-card";

export const emptyVariant = ({
  colorId = null,
  sizeId = null,
}: {
  colorId?: string | null;
  sizeId?: string | null;
}) => ({
  colorId,
  sizeId,
  sku: "",
  price: undefined,
  salePrice: undefined,
  stock: undefined,
});

export function ArrayError({ error }: { error: unknown }) {
  const e = error as
    | { root?: { message?: string }; message?: string }
    | undefined;
  const message = e?.root?.message ?? e?.message;
  if (!message) return null;
  return <FieldError errors={[{ message }]} />;
}
export const CreateProductForm = () => {
  const [colorId] = useState(() => crypto.randomUUID());
  const [sizeId] = useState(() => crypto.randomUUID());

  const form = useForm<z.input<typeof productValidator>>({
    resolver: zodResolver(productValidator),
    defaultValues: {
      name: "",
      slug: "",
      shortDesc: "",
      description: "",
      isVariant: false,
      price: undefined,
      salePrice: undefined,

      thumbnail: "",

      specification: [],
      tags: [],

      status: "inactive",
      categorySlug: "",
      subCategorySlug: "",
      colors: [{ id: colorId, name: "", hex: "", images: [] }],
      sizes: [
        {
          id: sizeId,
          size: "",
          variants: [emptyVariant({ colorId: colorId, sizeId })],
        },
      ],
    },
  });

  const isVariant = useWatch({ control: form.control, name: "isVariant" });

  // Watch for changes in isVariant and clear/reset colors and sizes
  useEffect(() => {
    if (!isVariant) {
      // Clear colors and sizes when isVariant is false
      form.setValue("colors", [{ id: colorId, name: "", hex: "", images: [] }]);
      form.setValue("sizes", [
        {
          id: sizeId,
          size: "",
          variants: [emptyVariant({ colorId: colorId, sizeId })],
        },
      ]);
    } else {
      // Restore initial colors and sizes if switched back to true and they are empty
      const currentColor = form.getValues("colors");
      const currentSizes = form.getValues("sizes");

      if (!currentColor || currentColor.length === 0) {
        form.setValue("colors", [
          { id: colorId, name: "", hex: "", images: [] },
        ]);
      }
      if (!currentSizes || currentSizes.length === 0) {
        form.setValue("sizes", [
          {
            id: sizeId,
            size: "",
            variants: [emptyVariant({ colorId: colorId, sizeId })],
          },
        ]);
      }
    }
  }, [isVariant, form, colorId, sizeId]);

  const { mutate, isPending } = useMutation({
    mutationFn: createProductAction,
    onSuccess: (data) => {
      console.log("data: ", data);
    },
    onError: (error) => {
      console.log("error: ", error);
    },
  });
  function onSubmit(data: z.input<typeof productValidator>) {
    // mutate(data);
    console.log(data);
  }
  return (
    <FormProvider {...form}>
      <form
        id="form-rhf-demo"
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid md:grid-cols-3 gap-5"
      >
        <div className="w-full md:col-span-2 space-y-6">
          <DetailsCard />
          <SpecificationCard />
          <VariantCard />
          <ColorsCard />
          <SizesCard />
        </div>
        <div className="w-full md:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start">
          <OrganizationCard />
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Discard
            </Button>
            {isPending ? (
              <LoadingButton />
            ) : (
              <Button type="submit">Create product</Button>
            )}
          </Field>
        </div>
      </form>
    </FormProvider>
  );
};
