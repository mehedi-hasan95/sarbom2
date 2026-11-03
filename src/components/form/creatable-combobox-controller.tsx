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

export const CreatableComboboxController = <T extends FieldValues>({
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

            <CreatableCombobox
              options={options}
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
