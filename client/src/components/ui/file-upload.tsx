import { Input } from "./input";
import { Label } from "./label";
import { useState } from "react";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
}

export function FileUpload({ 
  onUpload, 
  accept = ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
  label = "Upload Document",
  multiple = false,
  maxFiles = 100
}: FileUploadProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > maxFiles) {
      alert(`Please select no more than ${maxFiles} files.`);
      return;
    }

    setFileNames(files.map(f => f.name));
    onUpload(files);
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
        multiple={multiple}
      />
      {fileNames.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          <p>Selected {fileNames.length} files:</p>
          <ul className="mt-1 list-disc pl-5">
            {fileNames.slice(0, 5).map((name, i) => (
              <li key={i}>{name}</li>
            ))}
            {fileNames.length > 5 && (
              <li>...and {fileNames.length - 5} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}