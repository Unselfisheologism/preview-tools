import type React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  id: string;
  label: string;
  accept: string;
  onFileChange: (file: File | null) => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ id, label, accept, onFileChange, className }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2 mb-2 cursor-pointer">
        <UploadCloud className="w-5 h-5 text-primary" />
        {label}
      </Label>
      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
      />
    </div>
  );
};

export default FileUpload;
