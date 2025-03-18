import { Input } from "./input";
import { Label } from "./label";
import { useState } from "react";

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({ 
  onUpload, 
  accept = ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
  label = "Upload Document" 
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size === 0) {
        alert("The selected file appears to be empty. Please select a valid file.");
        return;
      }
      setFileName(file.name);
      onUpload(file);
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="document">{label}</Label>
      <Input
        id="document"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="cursor-pointer"
      />
      {fileName && (
        <p className="text-sm text-muted-foreground">Selected: {fileName}</p>
      )}
    </div>
  );
}