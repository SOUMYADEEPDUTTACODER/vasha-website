import { useState, useRef } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  acceptedTypes?: string;
}

export function FileUpload({ onFileSelected, acceptedTypes = "audio/*,video/*" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check file type
    const fileType = file.type;
    if (!fileType.startsWith('audio/') && !fileType.startsWith('video/')) {
      toast({
        title: "Unsupported file type",
        description: "Please upload an audio or video file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes}
        className="hidden"
      />

      {!selectedFile ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleButtonClick}
          className="hover:bg-primary/10 transition-colors"
        >
          <FileUp className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex items-center space-x-2 rounded-full bg-primary/10 px-3 py-1 text-xs">
          <span className="truncate max-w-[100px]">{selectedFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={removeFile}
            className="h-4 w-4 rounded-full p-0 hover:bg-primary/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}