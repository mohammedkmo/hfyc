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
import { useTranslations } from 'next-intl';

export default function FolderImageProcessor() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [mappings, setMappings] = useState<Mapping>({});
  const t = useTranslations('renamePhotos');

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const processedImages = imageFiles.map((file) => {
      return new Promise<ImageFile>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

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

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const renamedImages = renameImages(images, mappings);

    renamedImages.forEach((image) => {
      if (image.newName) {
        zip.file(image.newName, image.data.split(",")[1], { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `renamed_images${Date.now()}.zip`);
  };

  return (
    <main className="bg-gradient-to-t from-white via-white to-red-200 py-10 min-h-screen">
      <div className="container mx-auto flex flex-col gap-4 items-center justify-center bg-white rounded-2xl p-6 min-h-[85vh]">
        <div className="flex flex-col w-4/12">
          <div className="mb-5">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-xs text-muted-foreground">
              {t('common.byPCHBadgingTeam')}
            </p>
            <p className="text-sm text-muted-foreground border p-2 bg-yellow-50 border-yellow-200 text-yellow-800  rounded-lg mt-2">
              {t('common.noUploadDisclaimer')}
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-full max-w-sm items-center space-y-1">
              <Label htmlFor="picture">{t('form.selectImages')}</Label>
              <Input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFolderChange}
              />
              <p className="text-xs text-muted-foreground">
                {t('form.multipleImagesHint')}
              </p>
            </div>

            <div
              className={`flex items-center my-5 border rounded-lg ps-4 p-2 ${images.length < 1 && "hidden"
                }`}
            >
              {images.map(
                (image, index) =>
                  index < 10 && (
                    <div className="rounded-lg -ms-2 border bg-white border-white shadow-lg overflow-hidden w-11 h-11" key={index}>
                      <Image
                        src={image.data}
                        alt="Processed"
                        width={100}
                        height={100}
                        className="object-cover"
                      />
                    </div>
                  )
              )}
            </div>
            <div className="w-full max-w-sm items-center space-y-1">
              <Label htmlFor="excel">{t('form.excelFile')}</Label>
              <Input
                id="excel"
                type="file"
                multiple
                accept=".xlsx,.xls"
                onChange={(e) => handleExcelUpload(e, setMappings)}
              />
              <p className="text-xs text-muted-foreground">
                {t('form.excelFileHint')} <Link className="text-black font-bold" href="/rename/instructions">{t('form.here')}</Link>
              </p>
            </div>
          </div>

          <Button
            onClick={handleDownloadZip}
            className="mt-4"
            disabled={!images.length || !Object.keys(mappings).length}
          >
            {t('buttons.generateZIP')}
          </Button>
        </div>
      </div>
    </main>
  );
}