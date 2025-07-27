import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { axiosInstance } from "../utils/axios";
import { toast } from "sonner";
import { queryClient } from "../config/queryClient";
import { keys } from "../config/queryKeys";

interface UseFileUploadReturn {
  selectedFile: File | null;
  dragActive: boolean;
  uploadMutation: UseMutationResult<void, Error, File>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // First get the presigned URL
      const {
        data: { url, fileName },
      } = await axiosInstance.get("/presigned-url", {
        params: { contentType: file.type },
      });

      // Then upload directly to S3
      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload to S3");
      }

      toast.success("File uploaded successfully");

      //Last step, run moderate API call to check if the image is safe
      const { data: moderationData } = await axiosInstance.post("/moderate", {
        key: fileName,
      });

      if (moderationData.isAppropriate) {
        toast.success("File is appropriate");
      } else {
        toast.error("File is inappropriate");
      }

      queryClient.invalidateQueries({
        queryKey: [keys.stats],
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      uploadMutation.mutate(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return {
    selectedFile,
    dragActive,
    uploadMutation,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  };
};
