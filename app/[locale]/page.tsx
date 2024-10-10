'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserRound } from "lucide-react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { toast } = useToast();
  const t = useTranslations('common');
  
  return (
    <main className="bg-gradient-to-t from-white to-slate-200 py-10 min-h-screen">
      <div className="container mx-auto flex flex-col gap-4 items-center justify-center bg-white rounded-2xl p-6 min-h-[85vh]">
        <div className="grid grid-cols-1 gap-1 text-center items-center justify-center mt-10 md:mt-0">
          <h1 className="text-2xl font-bold">{t('appName')}</h1>
          <p className="text-sm text-slate-500">{t('whatLookingFor')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link className="group relative overflow-hidden h-80 w-60 bg-gray-100 border text-gray-500 hover:bg-blue-200 border-gray-200 hover:border-gray-300 rounded-md p-4 flex flex-col gap-2 items-center justify-center text-center transition-all duration-300 hover:scale-105" href="/personal">
            <Image className="absolute bottom-0 left-0  -translate-x-10 translate-y-10 transition-all duration-300 group-hover:left-14" src="/man3dai2.png" alt="Personal Badges" width={200} height={200} />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-gray-500 to-transparent to-70% transition-opacity duration-300 group-hover:opacity-75"></div>
            <h1 className="text-lg font-bold z-10 absolute bottom-5 text-white transition-all duration-300 group-hover:scale-110">{t('applyingForPersonalBadges')}</h1>
          </Link>

          {/* <Link className="group relative overflow-hidden h-80 w-60 bg-gray-100 border text-gray-500 hover:bg-green-200 border-gray-200 hover:border-gray-300 rounded-md p-4 flex flex-col gap-2 items-center justify-center text-center transition-all duration-300 hover:scale-105" href="/vehicles">
            <Image className="absolute top-10 left-0 -translate-x-10 translate-y-10 transition-all duration-300 group-hover:left-14" src="/Car.png" alt="Personal Badges" width={200} height={200} />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-gray-500 to-transparent to-70% transition-opacity duration-300 group-hover:opacity-75"></div>
            <h1 className="text-lg font-bold z-10 absolute bottom-5 text-white transition-all duration-300 group-hover:scale-110">{t('applyingForVehicleBadges')}</h1>
          </Link> */}

          <button  onClick={
            () => {
              toast({
                variant: 'destructive',
                title: t('comingSoon'),
                description: t('comingSoonDescription'),
              })
            }
          }  className="group relative overflow-hidden h-80 w-60 bg-gray-100 border text-gray-500 hover:bg-green-200 border-gray-200 hover:border-gray-300 rounded-md p-4 flex flex-col gap-2 items-center justify-center text-center transition-all duration-300 hover:scale-105">
            <Image className="absolute top-10 left-0 -translate-x-10 translate-y-10 transition-all duration-300 group-hover:left-14" src="/Car.png" alt="Personal Badges" width={200} height={200} />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-gray-500 to-transparent to-70% transition-opacity duration-300 group-hover:opacity-75"></div>
            <h1 className="text-lg font-bold z-10 absolute bottom-5 text-white transition-all duration-300 group-hover:scale-110">{t('applyingForVehicleBadges')}</h1>
          </button>


        </div>
      </div>
    </main>
  );
}
