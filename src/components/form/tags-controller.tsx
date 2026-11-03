import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "cn";
import { TagsInput } from "../common/tags-input";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  title?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxItems?: number;
  minItems?: number;
}

export const TagsController = <T extends FieldValues>({
  name,
  control,
  title,
  placeholder,
  className,
  disabled,
  maxItems,
  minItems,
}: Props<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="flex-1">
          <FieldLabel htmlFor={name} className={cn(className)}>
            {title}
          </FieldLabel>
          <TagsInput
            value={field.value ?? []}
            onValueChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            maxItems={maxItems}
            minItems={minItems}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
