import React, { useState } from "react";
import { FileUp } from "lucide-react";

const CustomFileUpload = ({ onChange, label }: any) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };

  return (
    <div className="file-upload h-16">
      <label className="file-upload-label">
        <FileUp className="file-upload-icon" />
        <span className="text-xs">{fileName || label}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-upload-input"
        />
      </label>
    </div>
  );
};

export default CustomFileUpload