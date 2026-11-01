"use client";

import { productValidator2 } from "@/zod-validator/product-validator2";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { DetailsCard } from "../_components/details-card";
import { SpecificationCard2 } from "./specification-card-2";
import { OrganizationCard2 } from "./organization-card-2";
import { Field, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createProductAction } from "@/action/products-action-2";
import { LoadingButton } from "@/components/common/loading-button";
import { useState } from "react";
import { ColorsCard2 } from "./colors-card-2";
import { SizesCard2 } from "./sizes-card-2";

export const emptyVariant = (colorKey: string | null = null) => ({
  colorKey,
  sku: "",
});

export function ArrayError({ error }: { error: unknown }) {
  const e = error as
    | { root?: { message?: string }; message?: string }
    | undefined;
  const message = e?.root?.message ?? e?.message;
  if (!message) return null;
  return <FieldError errors={[{ message }]} />;
}
export const CreateProductForm2 = () => {
  const [colorId] = useState(() => crypto.randomUUID());
  const [sizeId] = useState(() => crypto.randomUUID());

  const form = useForm<z.input<typeof productValidator2>>({
    resolver: zodResolver(productValidator2),
    defaultValues: {
      name: "",
      slug: "",
      shortDesc: "",
      description: "",
      isVariant: false,

      specification: [],

      status: "inactive",
      categorySlug: "",
      subCategorySlug: "",

      colors: [{ hex: "", id: colorId, images: [], name: "" }],

      sizes: [
        {
          size: "",
          compareAtPrice: undefined,
          price: undefined,
          variants: [emptyVariant(colorId)],
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
  function onSubmit(data: z.input<typeof productValidator2>) {
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
          <SpecificationCard2 />
          <ColorsCard2 />
          <SizesCard2 />
        </div>
        <div className="w-full md:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start">
          <OrganizationCard2 />
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
