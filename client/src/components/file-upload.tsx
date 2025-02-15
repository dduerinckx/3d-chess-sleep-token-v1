import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (content: string) => void;
  allowedTypes?: string[];
}

export function FileUpload({ 
  onUploadComplete,
  allowedTypes = [".pdf", ".doc", ".docx", ".txt"]
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.some(type => type.includes(fileExtension))) {
      toast({
        title: "Invalid file type",
        description: `Please upload one of the following: ${allowedTypes.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const { content } = await res.json();
      onUploadComplete(content);
      
      toast({
        title: "File uploaded successfully",
        description: "The content has been extracted and added."
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Input
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
        disabled={isUploading}
        className="max-w-sm"
      />
      {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
}
