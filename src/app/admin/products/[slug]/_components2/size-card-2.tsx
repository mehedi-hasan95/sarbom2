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
import { ProductFormInput } from "@/zod-validator/product-validator";
import { Plus, Trash2, X } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { ArrayError, emptyVariant } from "./create-product-form-2";

export const SizeCard2 = ({
  index,
  canRemove,
  onRemove,
}: {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}) => {
  const { control, formState } = useFormContext<ProductFormInput>();
  const colors = useWatch({ control, name: "colors" });
  const used = useWatch({ control, name: `sizes.${index}.variants` });
  const variants = useFieldArray({ control, name: `sizes.${index}.variants` });

  const isVariant = useWatch({ control, name: "isVariant" });

  const hasColors = colors.length > 0;

  const missingColors = colors.filter(
    (c) => !used.some((v) => v.colorKey === c.key),
  );

  // Lets Base UI resolve key -> label even when the popup is closed
  const colorItems = colors.map((c) => ({
    value: c.key,
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

          <InputController
            name={`sizes.${index}.price`}
            control={control}
            placeholder="20.00"
            title="Price"
          />

          <InputController
            name={`sizes.${index}.compareAtPrice`}
            control={control}
            placeholder="25.00"
            title="Compare-at price"
          />
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

      <div className="space-y-3">
        {variants.fields.map((variant, j) => (
          <div
            key={variant.id}
            className={
              hasColors
                ? "grid items-start gap-3 sm:grid-cols-[1.2fr_1fr_6.5rem_auto]"
                : "grid items-start gap-3 sm:grid-cols-[1fr_6.5rem_auto]"
            }
          >
            {hasColors && isVariant && (
              <Controller
                name={`sizes.${index}.variants.${j}.colorKey`}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor={`variant-${index}-${j}-color`}
                      className={j > 0 ? "sm:sr-only" : undefined}
                    >
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
                        className="w-full"
                      >
                        <SelectValue placeholder="Select a color">
                          {(value: string | null) => {
                            const item = colorItems.find(
                              (i) => i.value === value,
                            );
                            if (!item) return null;
                            return (
                              <span className="flex items-center gap-2">
                                <span
                                  aria-hidden
                                  className="size-3 rounded-full border"
                                  style={{ backgroundColor: item.hex }}
                                />
                                {item.label}
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
                              (u, k) => k !== j && u.colorKey === item.value,
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                aria-hidden
                                className="size-3 rounded-full border"
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

            <Controller
              name={`sizes.${index}.variants.${j}.sku`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={`variant-${index}-${j}-sku`}
                    className={j > 0 ? "sm:sr-only" : undefined}
                  >
                    SKU
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`variant-${index}-${j}-sku`}
                    aria-invalid={fieldState.invalid}
                    placeholder="TEE-M-BLU"
                    className="font-mono"
                    autoComplete="off"
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={j === 0 ? "sm:mt-6" : undefined}
              aria-label="Remove variant"
              disabled={variants.fields.length === 1}
              onClick={() => variants.remove(j)}
            >
              <X aria-hidden />
            </Button>
          </div>
        ))}

        <ArrayError error={formState.errors.sizes?.[index]?.variants} />

        {hasColors && missingColors.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              missingColors.forEach((c) => variants.append(emptyVariant(c.key)))
            }
          >
            <Plus aria-hidden />
            {missingColors.length === 1
              ? "Add missing color"
              : `Add ${missingColors.length} missing colors`}
          </Button>
        )}
      </div>
    </div>
  );
};
