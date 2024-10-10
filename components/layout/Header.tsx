'use client'

import { Github, LanguagesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';

export default function Header() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('common');

    const changeLanguage = (newLocale: string) => {
        const currentPath = pathname.replace(`/${locale}`, '');
        router.push(`/${newLocale}${currentPath}`);
        // Force a hard refresh to ensure the new language is applied
        window.location.href = `/${newLocale}${currentPath}`;
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' },
        { code: 'cn', name: '中文' }
    ];

    return (
        <header className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-sm border rounded-full w-7/12">
            <div className="container mx-auto flex items-center justify-between py-4">
                <div className="flex items-center gap-x-4">
                    <Link href={`/${locale}`} className="cursor-pointer">
                        <Image src="/logo.png" alt="PCH Logo" width={120} height={120} />
                    </Link>
                    <Link href={`/${locale}`} className={`cursor-pointer ${pathname === `/${locale}` ? 'text-red-500 font-bold' : 'text-black'}`}>
                        <span className="text-sm">{t('home')}</span>
                    </Link>
                    <Link href={`/${locale}/rename`} className={`cursor-pointer ${pathname === `/${locale}/rename` ? 'text-red-500 font-bold' : 'text-black'}`}>
                        <span className="text-sm">{t('renamePhotosTool')}</span>
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="link" className="flex items-center gap-x-2">
                                {languages.find(lang => lang.code === locale)?.name || 'Language'}
                                <LanguagesIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {languages.map((lang) => (
                                <DropdownMenuItem key={lang.code} onSelect={() => changeLanguage(lang.code)}>
                                    {lang.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <a href="https://github.com/mohammedkmo/hfyc" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <div className="p-2 rounded-xl bg-slate-200">
                            <Github size={18} className="text-black" />
                        </div>
                    </a>
                </div>
            </div>
        </header>
    );
}
