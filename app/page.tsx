"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageFile, Mapping } from "@/types/files";
import { renameImages } from "@/lib/renameImages";
import { handleExcelUpload } from "@/lib/handleExcelUpload";
import Link from "next/link";

// Define types for better type safety

export default function FolderImageProcessor() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [mappings, setMappings] = useState<Mapping>({});

  // Handle folder selection
  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/")); // Filter only images

    const processedImages = imageFiles.map((file) => {
      return new Promise<ImageFile>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Read the image as a data URL

        reader.onload = () => {
          resolve({
            originalName: file.name,
            data: reader.result as string,
            file,
          });
        };
      });
    });

    Promise.all(processedImages).then((results) => setImages(results));
  };

  // Generate ZIP file for download
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const renamedImages = renameImages(images, mappings);

    renamedImages.forEach((image) => {
      if (image.newName) {
        zip.file(image.newName, image.data.split(",")[1], { base64: true }); // Add renamed image to ZIP
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `renamed_images${Date.now()}.zip`); // Trigger ZIP download
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col">
          <div className="mb-5">
            <h1 className="text-2xl font-bold">Photos Renaming Tool</h1>
            <p className="text-xs text-muted-foreground">
              @By PCH Badging Team
            </p>
            <p className="text-sm text-muted-foreground border p-2 bg-yellow-50 border-yellow-200 text-yellow-800  rounded-lg mt-2">
              ⚠️ No files or photos will be uploaded to our server or any other
              servers all the functions are working on the client side only
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-full max-w-sm items-center space-y-1">
              <Label htmlFor="picture">Select Images</Label>
              <Input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFolderChange}
              />
              <p className="text-xs text-muted-foreground">
                You can select multiple images
              </p>
            </div>

            <div
              className={`flex items-center my-5 border rounded-lg ps-4 p-2 ${
                images.length < 1 && "hidden"
              }`}
            >
              {images.map(
                (image, index) =>
                  index < 10 && ( // Display only first 5 images
                    <div className="rounded-lg -ms-2 border bg-white border-white shadow-lg overflow-hidden w-10 h-10" key={index}>
                      <Image
                      src={image.data}
                      alt="Processed"
                      width={100}
                      height={100}
                      className="object-cover h-full w-full"
                    />
                    </div>
                  )
              )}
            </div>
            <div className="w-full max-w-sm items-center space-y-1">
              <Label htmlFor="excel">Excel file</Label>
              <Input
                id="excel"
                type="file"
                multiple
                accept=".xlsx,.xls"
                onChange={(e) => handleExcelUpload(e, setMappings)}
              />
              <p className="text-xs text-muted-foreground">
                Upload an Excel file with HFYC Number, First Name, and Last Name
                columns. please read the following instructions <Link className="text-black font-bold" href="/instructions">here</Link>
              </p>
            </div>
          </div>

          <Button
            onClick={handleDownloadZip}
            className="mt-4"
            disabled={!images.length || !Object.keys(mappings).length}
          >
            Download Renamed Images as ZIP
          </Button>
        </div>
      </div>
    </div>
  );
}
