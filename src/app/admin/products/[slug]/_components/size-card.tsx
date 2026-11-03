"use client";

import { InputController } from "@/components/form/input-controller";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import z from "zod";
import { productValidator } from "@/zod-validator/product-validator";
import { ArrayError, emptyVariant } from "./create-product-form";

export const SizeCard = ({
  index,
  canRemove,
  onRemove,
}: {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}) => {
  const { control, formState, setValue } =
    useFormContext<z.input<typeof productValidator>>();
  const colors = useWatch({ control, name: "colors" });
  const used = useWatch({ control, name: `sizes.${index}.variants` });
  const variants = useFieldArray({ control, name: `sizes.${index}.variants` });

  const isVariant = useWatch({ control, name: "isVariant" });

  const hasColors = colors.length > 0;

  const missingColors = colors.filter(
    (c) => !used.some((v) => v.colorId === c.id),
  );

  // Lets Base UI resolve key -> label even when the popup is closed
  const colorItems = colors.map((c) => ({
    value: c.id,
    label: c.name || c.hex || "Unnamed color",
    hex: c.hex,
  }));

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          {isVariant && (
            <InputController
              name={`sizes.${index}.size`}
              control={control}
              placeholder="M"
              title="Size"
            />
          )}
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6"
            aria-label={`Remove size ${index + 1}`}
            onClick={onRemove}
          >
            <Trash2 aria-hidden />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {variants.fields.map((variant, j) => (
          <div
            key={variant.id}
            className="group relative rounded-xl border bg-card transition-colors hover:border-foreground/20"
          >
            {/* Variant header */}
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg border bg-background text-sm font-semibold text-muted-foreground">
                  {j + 1}
                </div>

                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Variant {j + 1}</p>
                  <p className="text-xs text-muted-foreground">
                    {hasColors && isVariant
                      ? "Color, SKU and pricing"
                      : "SKU and pricing"}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove variant ${j + 1}`}
                disabled={variants.fields.length === 1}
                onClick={() => variants.remove(j)}
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            {/* Variant fields */}
            <div
              className={
                hasColors && isVariant
                  ? "grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5"
                  : "grid gap-4 p-4 sm:grid-cols-2"
              }
            >
              {hasColors && isVariant && (
                <Controller
                  name={`sizes.${index}.variants.${j}.colorId`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`variant-${index}-${j}-color`}>
                        Color
                      </FieldLabel>

                      <Select
                        name={field.name}
                        items={colorItems}
                        value={field.value || null}
                        onValueChange={(v) => field.onChange(v ?? "")}
                      >
                        <SelectTrigger
                          id={`variant-${index}-${j}-color`}
                          aria-invalid={fieldState.invalid}
                          className="w-full bg-background"
                        >
                          <SelectValue placeholder="Select color">
                            {(value: string | null) => {
                              const item = colorItems.find(
                                (i) => i.value === value,
                              );

                              if (!item) return null;

                              return (
                                <span className="flex items-center gap-2">
                                  <span
                                    aria-hidden
                                    className="size-3 shrink-0 rounded-full border border-black/10"
                                    style={{ backgroundColor: item.hex }}
                                  />
                                  <span className="truncate">{item.label}</span>
                                </span>
                              );
                            }}
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                          {colorItems.map((item) => (
                            <SelectItem
                              key={item.value}
                              value={item.value}
                              disabled={used.some(
                                (u, k) => k !== j && u.colorId === item.value,
                              )}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  aria-hidden
                                  className="size-3 shrink-0 rounded-full border border-black/10"
                                  style={{ backgroundColor: item.hex }}
                                />
                                {item.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}

              <InputController
                name={`sizes.${index}.variants.${j}.sku`}
                control={control}
                title="SKU"
                placeholder="TEE-M-BLU"
                onChange={(e) => {
                  setValue(`sizes.${index}.variants.${j}.sku`, e.toUpperCase());
                }}
              />

              {isVariant && (
                <>
                  <InputController
                    control={control}
                    name={`sizes.${index}.variants.${j}.price`}
                    title="Regular price"
                    placeholder="e.g. 10.00"
                  />

                  <InputController
                    control={control}
                    name={`sizes.${index}.variants.${j}.salePrice`}
                    title="Sale price"
                    placeholder="e.g. 15.00"
                  />
                </>
              )}
              <InputController
                control={control}
                name={`sizes.${index}.variants.${j}.stock`}
                title="Product Stock"
                placeholder="e.g. 100"
              />
            </div>
          </div>
        ))}

        <ArrayError error={formState.errors.sizes?.[index]?.variants} />

        {hasColors && missingColors.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed sm:w-auto"
            onClick={() =>
              missingColors.forEach((c) =>
                variants.append(emptyVariant({ colorId: c.id })),
              )
            }
          >
            <Plus className="mr-1 size-4" aria-hidden />
            {missingColors.length === 1
              ? "Add missing color"
              : `Add ${missingColors.length} missing colors`}
          </Button>
        )}
      </div>
    </div>
  );
};
