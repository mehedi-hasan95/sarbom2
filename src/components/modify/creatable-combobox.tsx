"use client";

import { useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type Option = {
  label: string;
  value: string;
};

interface Props {
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const CreatableCombobox = ({
  options,
  placeholder = "Select or type...",
  value,
  onChange,
  disabled,
}: Props) => {
  const [inputValue, setInputValue] = useState("");

  const selectedOption = options.find((option) => option.value === value);

  const displayValue = selectedOption?.label ?? value ?? "";

  return (
    <Combobox
      items={options}
      value={value ?? ""}
      onValueChange={(newValue) => {
        onChange?.(String(newValue ?? ""));
        setInputValue("");
      }}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        value={inputValue || displayValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            onChange?.(inputValue.trim());
            setInputValue("");
          }
        }}
        showClear={!!value && !inputValue}
        className={"w-full"}
      />

      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>

        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
