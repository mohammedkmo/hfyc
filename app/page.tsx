'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, UserRound } from "lucide-react";
export default function HomePage() {
  return (
    <main className=" bg-slate-100 pattern">
      <div className="container mx-auto flex flex-col gap-4 items-center justify-center min-h-[94vh]">
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className="text-2xl font-bold">PCH Badging tools</h1>
          <p className="text-sm text-slate-500">What are you looking for?</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link className="h-80 w-60 bg-blue-100 border text-blue-500 shadow-xl shadow-blue-300/40 hover:bg-blue-200 border-blue-200  rounded-md p-4 flex flex-col gap-2 items-center justify-center text-center" href="/personal">
            <UserRound className="w-10 h-10" />
            <h1>Applying for Personal Badges</h1>
          </Link>

          <Link className="h-80 w-60 bg-orange-100 border text-orange-500 shadow-xl shadow-orange-300/40 hover:bg-orange-200 border-orange-200  rounded-md p-4 flex flex-col gap-2 items-center justify-center text-center" href="/vehicles">
            <Car className="w-10 h-10" />
            <h1>Applying for Vehicle Badges</h1>
          </Link>
        </div>

      </div>
    </main>
  );
}
