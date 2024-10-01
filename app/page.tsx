'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserRound } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className=" bg-slate-100 pattern">
      <div className="container mx-auto flex flex-col gap-4 items-center justify-center min-h-[94vh]">
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className="text-2xl font-bold">PCH Badging tools</h1>
          <p className="text-sm text-slate-500">What are you looking for?</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link className="relative overflow-hidden h-80 w-60 bg-blue-100 border text-blue-500  hover:bg-blue-200 border-blue-200 hover:border-blue-300  rounded-md p-4 flex flex-col gap-2 items-center justify-center text-center" href="/personal">
            <Image className="absolute top-0 left-0 -translate-x-10 translate-y-10" src="/personal.png" alt="Personal Badges" width={200} height={200} />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-blue-500 to-transparent to-70%"></div>
            <h1 className="text-lg font-bold z-10 absolute bottom-5 text-white">Applying for Personal Badges</h1>
          </Link>

          <Link className="relative overflow-hidden h-80 w-60 bg-slate-100 border text-slate-500  hover:bg-slate-200 border-slate-200 hover:border-slate-300  rounded-md p-4 flex flex-col gap-2 items-center justify-center text-center" href="/vehicles">
            <Image className="absolute top-10 left-0 -translate-x-10 translate-y-10" src="/Car.png" alt="Personal Badges" width={200} height={200} />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-500 to-transparent to-70%"></div>
            <h1 className="text-lg font-bold z-10 absolute bottom-5 text-white">Applying for Vehicle Badges</h1>
          </Link>

          
        </div>

      </div>
    </main>
  );
}
