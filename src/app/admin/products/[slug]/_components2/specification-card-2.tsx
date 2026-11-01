"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { FieldGroup } from "@/components/ui/field";
import { InputController } from "@/components/form/input-controller";
import { ModifyCard } from "../_components/modify-card";
import z from "zod";
import { productValidator2 } from "@/zod-validator/product-validator2";

export const SpecificationCard2 = () => {
  const { control } = useFormContext<z.infer<typeof productValidator2>>();
  const rows = useFieldArray({ control, name: "specification" });

  const sp = useWatch({ control: control, name: "specification" });
  const hasEmptyRow = (sp ?? []).some(
    (item) => !item?.key?.trim() || !item?.value?.trim(),
  );
  return (
    <ModifyCard
      title="Specifications (Optional)"
      description="Facts like material, weight or care instructions."
    >
      <FieldGroup>
        {rows.fields.map((row, i) => (
          <div key={row.id} className="flex items-start gap-5">
            <InputController
              control={control}
              name={`specification.${i}.value`}
              placeholder="Material"
              title="fuck"
              hideTitle
            />
            <InputController
              control={control}
              name={`specification.${i}.key`}
              title="fuck"
              placeholder="100% organic cotton"
              hideTitle
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove specification"
              onClick={() => rows.remove(i)}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        ))}

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => rows.append({ key: "", value: "" })}
            disabled={hasEmptyRow}
          >
            <Plus aria-hidden /> Add specification
          </Button>
        </div>
      </FieldGroup>
    </ModifyCard>
  );
};
