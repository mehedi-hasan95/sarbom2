"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/zod-validator/product-validator"; // adjust to where you put the validator
import { DetailsCard } from "./details-card";
import { SpecificationCard } from "./specification-card";
import { ColorsCard } from "./colors-card";
import { SizesCard } from "./sizes-card";
import { OrganizationCard } from "./organization-card";
import { useMutation } from "@tanstack/react-query";
import { createProductAction } from "@/action/products-action";

export const emptyVariant = (colorKey: string | null = null) => ({
  colorKey,
  sku: "",
});

/** array-level errors (e.g. "Add at least one size") live on `.root` or `.message` */
export function ArrayError({ error }: { error: unknown }) {
  const e = error as
    | { root?: { message?: string }; message?: string }
    | undefined;
  const message = e?.root?.message ?? e?.message;
  if (!message) return null;
  return <FieldError errors={[{ message }]} />;
}

/* -------------------------------------------------------------------------- */
/*  Main form                                                                 */
/* -------------------------------------------------------------------------- */

export function CreateProductForm() {
  const [initialColorKey] = React.useState(() => crypto.randomUUID());
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      slug: "",
      shortDesc: "",
      description: "",
      categorySlug: "",
      subCategorySlug: "",
      status: "inactive",
      specification: [],
      colors: [{ key: initialColorKey, name: "", hex: "", images: [] }],
      isVariant: false,
      sizes: [
        {
          size: "",
          price: "",
          compareAtPrice: "",
          variants: [emptyVariant(initialColorKey)],
        },
      ],
    },
  });

  const { isSubmitting, isSubmitted, isValid } = form.formState;

  const { mutate, isPending } = useMutation({
    mutationFn: createProductAction,
    onSuccess: (data) => {
      console.log("data: ", data);
    },
    onError: (error) => {
      console.log("error: ", error);
    },
  });
  function onSubmit(data: ProductFormValues) {
    mutate(data);
  }
  return (
    <FormProvider {...form}>
      <form
        id="form-create-product"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="space-y-6">
          <DetailsCard />
          <SpecificationCard />
          <ColorsCard />
          <SizesCard />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <OrganizationCard />
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => form.reset()}
            >
              Discard
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
              Create product
            </Button>
          </Field>
          {isSubmitted && !isValid && (
            <FieldError
              errors={[
                {
                  message:
                    "Some fields need attention. Check the highlighted fields.",
                },
              ]}
            />
          )}
        </aside>
      </form>
    </FormProvider>
  );
}
