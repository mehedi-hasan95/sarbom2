"use client";

import { productValidator } from "@/zod-validator/product-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { SpecificationCard } from "./specification-card";
import { OrganizationCard } from "./organization-card";
import { Field, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createProductAction } from "@/action/products-action-2";
import { LoadingButton } from "@/components/common/loading-button";
import { useState } from "react";
import { ColorsCard } from "./colors-card";
import { SizesCard } from "./sizes-card";
import { DetailsCard } from "./details-card";
import { VariantCard } from "./variant-card";

export const emptyVariant = ({
  colorKey = null,
  sizeKey = null,
}: {
  colorKey?: string | null;
  sizeKey?: string | null;
}) => ({
  colorKey,
  sizeKey,
  sku: "",
  price: undefined,
  salePrice: undefined,
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
  const [initialColorKey] = useState(() => crypto.randomUUID());
  const [sizeKey] = useState(() => crypto.randomUUID());

  const form = useForm<z.input<typeof productValidator>>({
    resolver: zodResolver(productValidator),
    defaultValues: {
      name: "",
      slug: "",
      shortDesc: "",
      description: "",
      isVariant: false,
      price: undefined,
      thumbnail: "",

      specification: [],

      status: "inactive",
      categorySlug: "",
      subCategorySlug: "",
      colors: [{ id: initialColorKey, name: "", hex: "", images: [] }],
      sizes: [
        {
          id: sizeKey,
          size: "",
          variants: [emptyVariant({ colorKey: initialColorKey, sizeKey })],
        },
      ],
    },
  });

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
