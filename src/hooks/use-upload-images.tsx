"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";
import { prependImages } from "../transtack-options/image-query";
import { useState } from "react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

type Endpoint = keyof OurFileRouter;
export function useUploadImages(endPoint: Endpoint) {
  const queryClient = useQueryClient();
  // overall progress of the current batch, 0-100
  const [progress, setProgress] = useState(0);

  const { startUpload } = useUploadThing(endPoint, {
    onUploadProgress: (p) => setProgress(Math.round(p)),
  });

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      setProgress(0);
      const res = await startUpload(files);
      if (!res?.length) throw new Error("Upload failed");
      return res.map((r) => r.serverData); // { id, url, createdAt }[]
    },
    onSuccess: (items) => prependImages(queryClient, items),
    onError: (e) =>
      toast.error(
        e.message || "Upload failed. Check your connection and try again.",
      ),
    onSettled: () => setProgress(0),
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    progress,
  };
}
