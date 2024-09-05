'use client'

import React, { useState, useEffect } from 'react';
import { FileUp } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

const CustomFileUpload = ({ onChange, label, initialFile }: any) => {
  const [fileName, setFileName] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (initialFile) {
      setFileName(initialFile.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(initialFile);
    }
  }, [initialFile]);

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);

      // Generate a URL for the image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="file-upload">
      <label className="file-upload-label text-xs">
        <FileUp className="file-upload-icon" />
        <span>{fileName.length > 30 ? fileName.slice(0,30) + "......" : fileName}</span>
        <Input type="file" onChange={handleFileChange} className="file-upload-input" />
      </label>
      {imagePreview && (
        <div className="image-preview w-full h-40 rounded-lg overflow-hidden">
          <Image className="object-cover" src={imagePreview} width={400} height={100} alt="Image Preview" />
        </div>
      )}
    </div>
  );
};

export default CustomFileUpload;