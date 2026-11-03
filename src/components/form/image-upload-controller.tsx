"use client";

import { OurFileRouter } from "@/app/api/uploadthing/core";
import { ImageLibraryDialog } from "@/components/common/image-library-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { useUploadImages } from "@/hooks/use-upload-images";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef } from "react";
import {
  Control,
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { toast } from "sonner";

type ImageUploadFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  title?: string;
  maxImages?: number;
  endpoint: keyof OurFileRouter;
  accept?: string;
  showLibrary?: boolean;
  helperText?: string;
  mode?: "single" | "multiple";
  control: Control<T>;
};

export function ImageUploadController<T extends FieldValues>({
  name,
  title,
  maxImages = 8,
  endpoint,
  accept = "image/png,image/jpeg,image/webp,image/avif",
  showLibrary = true,
  helperText = "Add PNG, JPEG, WebP or AVIF images",
  mode = "multiple",
  control,
}: ImageUploadFieldProps<T>) {
  const { getValues } = useFormContext<T>();
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useUploadImages(endpoint);

  const isSingleImage = mode === "single";
  const imageLimit = isSingleImage ? 1 : maxImages;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const images: string[] = isSingleImage
          ? typeof field.value === "string" && field.value
            ? [field.value]
            : []
          : Array.isArray(field.value)
            ? field.value.filter(
                (value: unknown): value is string => typeof value === "string",
              )
            : [];

        const hasImage = images.length > 0;
        const canAddImage = images.length < imageLimit;

        // Convert the rendered image list back to the correct form value.
        function updateImages(urls: string[]) {
          const limitedUrls = urls.slice(0, imageLimit);

          if (isSingleImage) {
            field.onChange(limitedUrls[0] ?? "");
          } else {
            field.onChange(limitedUrls);
          }
        }

        async function handleFiles(files: FileList | null) {
          if (!files?.length || upload.isPending) return;

          const room = isSingleImage
            ? 1
            : Math.max(0, maxImages - images.length);

          if (room === 0) {
            toast.error(`You can upload a maximum of ${maxImages} images.`);
            return;
          }

          const selectedFiles = Array.from(files).slice(0, room);

          try {
            const uploaded = await upload.mutateAsync(selectedFiles);

            const urls = uploaded
              .map((image) => image.url)
              .filter(
                (url): url is string =>
                  typeof url === "string" && url.length > 0,
              );

            if (isSingleImage) {
              // A new upload replaces the existing single image.
              if (urls[0]) {
                updateImages([urls[0]]);
              }

              return;
            }

            // Read the latest array value after the upload finishes.
            const latestValue: unknown = getValues(name);

            const currentImages: string[] = Array.isArray(latestValue)
              ? latestValue.filter(
                  (value: unknown): value is string =>
                    typeof value === "string",
                )
              : [];

            const uniqueUrls = urls.filter(
              (url) => !currentImages.includes(url),
            );

            updateImages([...currentImages, ...uniqueUrls]);
          } catch {
            // The upload hook handles errors and notifications.
          } finally {
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }
        }

        return (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>{title}</FieldLabel>

              {showLibrary && (
                <ImageLibraryDialog
                  selected={images}
                  max={imageLimit}
                  onConfirm={(urls) => {
                    updateImages(urls);
                  }}
                />
              )}
            </div>

            {isSingleImage ? (
              // Single-image preview
              <div className="space-y-3">
                {hasImage ? (
                  <div className="relative w-full max-w-sm overflow-hidden rounded-xl border bg-muted">
                    <div className="aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[0]}
                        alt="Selected image preview"
                        className="size-full object-contain"
                      />
                    </div>

                    <Badge className="absolute left-3 top-3">Preview</Badge>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      aria-label="Remove image"
                      className="absolute right-3 top-3 size-8"
                      onClick={() => updateImages([])}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={upload.isPending}
                    onClick={() => inputRef.current?.click()}
                    className="flex min-h-48 w-full max-w-sm flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/30 p-6 text-center transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {upload.isPending ? (
                      <Loader2 className="size-8 animate-spin text-blue-500" />
                    ) : (
                      <div className="rounded-full border bg-background p-3">
                        <ImagePlus className="size-6 text-muted-foreground" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {upload.isPending
                          ? upload.progress < 100
                            ? `Uploading ${upload.progress}%`
                            : "Saving image..."
                          : "Upload an image"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {helperText}
                      </p>
                    </div>

                    {upload.isPending && (
                      <Slider
                        value={[upload.progress]}
                        min={0}
                        max={100}
                        disabled
                        aria-label="Upload progress"
                        className="pointer-events-none max-w-48 **:data-[slot=slider-range]:bg-blue-500! **:data-[slot=slider-thumb]:hidden"
                      />
                    )}
                  </button>
                )}
              </div>
            ) : (
              // Multiple-image grid
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {images.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Uploaded image ${index + 1}`}
                      className="size-full object-cover"
                    />

                    {index === 0 && (
                      <Badge className="absolute bottom-1 left-1">Main</Badge>
                    )}

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      aria-label={`Remove image ${index + 1}`}
                      className="absolute right-1 top-1 size-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                      onClick={() => {
                        updateImages(images.filter((_, i) => i !== index));
                      }}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ))}

                {canAddImage && (
                  <button
                    type="button"
                    disabled={upload.isPending}
                    onClick={() => inputRef.current?.click()}
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-2 text-center text-xs text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {upload.isPending ? (
                      <>
                        <Loader2
                          className="size-5 animate-spin text-blue-500"
                          aria-hidden="true"
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
                          aria-label="Upload progress"
                          className="pointer-events-none px-3 **:data-[slot=slider-range]:bg-blue-500! **:data-[slot=slider-thumb]:hidden"
                        />
                      </>
                    ) : (
                      <>
                        <ImagePlus className="size-5" aria-hidden="true" />
                        <span>Upload</span>
                        <span>{helperText}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              multiple={!isSingleImage}
              accept={accept}
              className="sr-only"
              disabled={upload.isPending}
              onChange={(event) => {
                void handleFiles(event.currentTarget.files);
              }}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
