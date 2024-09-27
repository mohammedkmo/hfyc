import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
            <div className="container mx-auto flex items-center justify-between py-4">
                <Link href="/" className="cursor-pointer">
                    <Image src="/logo.png" alt="PCH Logo" width={120} height={120} />
                </Link>
                <a href="https://github.com/mohammedkmo/hfyc" target="_blank" className="cursor-pointer">
         
                        <div className="p-2 rounded-xl bg-slate-200">
                            <Github size={18} className="text-black" />
                        </div>
             
                </a>
            </div>
        </header>
    );
}
