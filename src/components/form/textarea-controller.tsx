import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "cn";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "../ui/input-group";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  title?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxNumber?: number;
}

export const TextareaController = <T extends FieldValues>({
  name,
  control,
  title,
  placeholder,
  className,
  disabled,
  maxNumber,
}: Props<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <div className="flex items-center">
            <FieldLabel htmlFor={name}>{title}</FieldLabel>
          </div>

          <InputGroup>
            <InputGroupTextarea
              {...field}
              id={name}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              rows={3}
              className={cn("min-h-16 resize-none", className)}
              disabled={disabled}
              value={field.value ?? ""}
            />
            {maxNumber && (
              <InputGroupAddon align="block-end">
                <InputGroupText className="tabular-nums">
                  {field.value.length}/{maxNumber} characters
                </InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
