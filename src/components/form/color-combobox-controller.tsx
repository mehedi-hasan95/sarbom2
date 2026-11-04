import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { cn } from "cn";
import { CreatableCombobox } from "../modify/creatable-combobox";

type Option = { label: string; value: string };

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  title?: string;
  placeholder?: string;
  options: Option[];
  className?: string;
  disabled?: boolean;
}

export const ColorComboboxController = <T extends FieldValues>({
  name,
  control,
  title,
  placeholder = "Select an option",
  options,
  className,
  disabled,
}: Props<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        return (
          <Field data-invalid={fieldState.invalid} className={cn(className)}>
            {title && (
              <div className="flex items-center">
                <FieldLabel htmlFor={name}>{title}</FieldLabel>
              </div>
            )}
            <div className="flex gap-2 w-full">
              <input
                type="color"
                aria-label="Pick a color"
                value={
                  /^#[0-9a-f]{6}$/i.test(field.value ?? "")
                    ? field.value!
                    : "#000000"
                }
                onChange={(e) => field.onChange(e.target.value)}
                className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
              />
              <CreatableCombobox
                options={options}
                value={field.value}
                onChange={field.onChange}
                placeholder={placeholder}
                disabled={disabled}
              />
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
