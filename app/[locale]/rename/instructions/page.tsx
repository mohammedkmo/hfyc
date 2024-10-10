'use client'

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react"
import { useTranslations } from 'next-intl';

export default function Page() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const t = useTranslations('renamePhotos.instructions');

    const handleDownloadExcel = () => {
        const link = document.createElement('a');
        link.href = '/register.xlsx';
        link.download = 'register.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleModal = () => {
      setIsModalOpen(!isModalOpen);
    };
    
  return (
    <main className="min-h-screen w-full bg-gray-100">
      <div className="container w-4/12 m-auto h-full flex items-center justify-center min-h-screen">
        <div className="flex flex-col">
          <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
          <div className="text-sm">
            {t('excelRequirements')}
          </div>
          </div>

          <Image onClick={toggleModal} className="border rounded-lg mt-4 bg-white shadow-sm" src="/excel-example.png" alt="Excel example" width={500} height={300} />

          <Button variant="link" onClick={handleDownloadExcel}>{t('downloadExcel')}</Button>
        </div>

        {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg relative">
            <button onClick={toggleModal} className="absolute top-5 right-5 p-2 rounded-lg bg-red-100 border-red-200 text-red-500"><X/></button>
            <Image
              src="/excel-example.png"
              alt="Excel example"
              width={800}
              height={600}
            />
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
