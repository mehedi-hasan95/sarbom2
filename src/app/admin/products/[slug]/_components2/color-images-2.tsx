"use client";

import { ImageLibraryDialog } from "@/components/common/image-library-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { useUploadImages } from "@/hooks/use-upload-images";
import { ProductFormInput } from "@/zod-validator/product-validator";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";

export const ColorImages2 = ({ index }: { index: number }) => {
  const { control, getValues } = useFormContext<ProductFormInput>();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImages();

  const MAX_IMAGES = 8;
  return (
    <Controller
      name={`colors.${index}.images`}
      control={control}
      render={({ field, fieldState }) => {
        async function handleFiles(files: FileList | null) {
          if (!files?.length) return;

          const room = MAX_IMAGES - field.value.length;
          if (room <= 0) return;

          try {
            const uploaded = await upload.mutateAsync(
              Array.from(files).slice(0, room),
            );

            // auto-select: append to the latest form value (it may have changed mid-upload)
            const current = getValues(`colors.${index}.images`);
            const urls = uploaded
              .map((u) => u.url)
              .filter((u) => !current.includes(u));
            field.onChange([...current, ...urls].slice(0, MAX_IMAGES));
          } catch {
            // toast already shown by the mutation's onError
          } finally {
            if (inputRef.current) inputRef.current.value = "";
          }
        }

        return (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor={`color-${index}-images`}>Images</FieldLabel>
              <ImageLibraryDialog
                selected={field.value}
                max={MAX_IMAGES}
                onConfirm={field.onChange}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {field.value.map((url, i) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="size-full object-cover" />
                  {i === 0 && (
                    <Badge className="absolute bottom-1 left-1">Main</Badge>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    aria-label="Remove image"
                    className="absolute top-1 right-1 size-6 opacity-100 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={() =>
                      field.onChange(field.value.filter((_, j) => j !== i))
                    }
                  >
                    <X aria-hidden />
                  </Button>
                </div>
              ))}

              {field.value.length < MAX_IMAGES && (
                <button
                  type="button"
                  disabled={upload.isPending}
                  onClick={() => inputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60 cursor-pointer"
                >
                  {upload.isPending ? (
                    <>
                      <Loader2
                        className="size-5 animate-spin text-blue-500"
                        aria-hidden
                      />

                      <span aria-live="polite">
                        {upload.progress < 100
                          ? `${upload.progress}%`
                          : "Saving"}
                      </span>

                      <Slider
                        value={[upload.progress]}
                        min={0}
                        max={100}
                        disabled
                        className="pointer-events-none **:data-[slot=slider-range]:bg-blue-500! **:data-[slot=slider-thumb]:hidden px-5"
                        aria-label="Upload progress"
                      />
                    </>
                  ) : (
                    <div className="flex flex-col place-items-center">
                      <>
                        <ImagePlus className="size-5" aria-hidden />
                        Upload
                      </>
                      <span>Add png, jpeg, webp or avif images</span>
                    </div>
                  )}
                </button>
              )}
            </div>

            <input
              ref={inputRef}
              id={`color-${index}-images`}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
