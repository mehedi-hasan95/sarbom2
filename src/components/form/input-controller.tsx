import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  title?: string;
  placeholder?: string;
  inputTypes?: "text" | "password" | "email" | "number";
  className?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  hideTitle?: boolean;
}

export const InputController = <T extends FieldValues>({
  name,
  control,
  title,
  placeholder,
  inputTypes = "text",
  className,
  disabled,
  onChange,
  hideTitle = false,
}: Props<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="flex-1">
          <FieldLabel
            htmlFor={name}
            className={cn(hideTitle && "sr-only", className)}
          >
            {title}
          </FieldLabel>
          <Input
            {...field}
            id={name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            type={inputTypes}
            // className={cn("", className)}
            disabled={disabled}
            value={field.value ?? ""}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e.target.value);
            }}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
