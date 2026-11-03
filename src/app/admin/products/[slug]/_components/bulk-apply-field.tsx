"use client";

import { useState } from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ArrowDownToLine, Check } from "lucide-react";

export type BulkField = {
  label: string;
  value: string;
  placeholder?: string;
  step?: string;
};

type BulkApplyFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  fields: BulkField[];
  title?: string;
  description?: string;
  onApply?: (field: string, value: string) => void;
};

export function BulkApplyField<T extends FieldValues>({
  control,
  name,
  fields,
  title = "Bulk update variants",
  description = "Apply the same value to all sizes and colors.",
  onApply,
}: BulkApplyFieldProps<T>) {
  const { getValues, setValue } = useFormContext<T>();

  const [selectedField, setSelectedField] = useState(fields[0]?.value ?? "");

  const [value, setValueInput] = useState("");

  const selectedOption = fields.find((field) => field.value === selectedField);

  function applyValue() {
    if (!selectedField || value === "") return;

    const sizes = getValues(name) as
      | {
          variants?: Record<string, unknown>[];
        }[]
      | undefined;

    sizes?.forEach((size, i) => {
      size.variants?.forEach((_, j) => {
        setValue(
          `${String(name)}.${i}.variants.${j}.${selectedField}` as FieldPath<T>,
          value as never,
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );
      });
    });

    onApply?.(selectedField, value);
  }

  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
          <ArrowDownToLine className="size-4 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Select
          value={selectedField}
          onValueChange={(v) => {
            setSelectedField(v ?? "");
            setValueInput("");
          }}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>

          <SelectContent>
            {fields.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min="0"
          step={selectedOption?.step ?? "any"}
          value={value}
          onChange={(e) => setValueInput(e.target.value)}
          placeholder={selectedOption?.placeholder ?? "Enter value"}
          className="bg-background"
        />

        <Button
          type="button"
          onClick={applyValue}
          disabled={!selectedField || value === ""}
          className="gap-2"
        >
          <Check className="size-4" />
          Apply
        </Button>
      </div>
    </div>
  );
}
