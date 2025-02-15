'use client'

import { Github, LanguagesIcon, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useState } from "react";

export default function Header() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('common');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const changeLanguage = (newLocale: string) => {
        const currentPath = pathname.replace(`/${locale}`, '');
        router.push(`/${newLocale}${currentPath}`);
        window.location.href = `/${newLocale}${currentPath}`;
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' },
        { code: 'cn', name: '中文' }
    ];

    const NavLinks = () => (
        <>
            <Link href={`/${locale}`} className={`cursor-pointer ${pathname === `/${locale}` ? 'text-red-500 font-bold' : 'text-black'}`}>
                <span className="text-sm">{t('home')}</span>
            </Link>
            <Link href={`/${locale}/personal`} className={`cursor-pointer ${pathname === `/${locale}/personal`? 'text-red-500 font-bold' : 'text-black'}`}>
                <span className="text-sm">{t('personalBadges')}</span>
            </Link>
            <Link href={`/${locale}/vehicles`} className={`cursor-pointer ${pathname === `/${locale}/vehicles`? 'text-red-500 font-bold' : 'text-black'}`}>
                <span className="text-sm">{t('vehicleBadges')}</span>
            </Link>
        </>
    );

    return (
        <header className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-sm border rounded-full w-11/12 md:w-7/12">
            <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
                <div className="flex items-center gap-x-4">
                    <Link href={`/${locale}`} className="cursor-pointer">
                        <Image src="/logo.png" alt="PCH Logo" width={80} height={80} className="w-24 md:w-28" />
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-x-4">
                        <NavLinks />
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="link" className="flex items-center gap-x-1">
                                <span className="hidden md:inline">
                                    {languages.find(lang => lang.code === locale)?.name || 'Language'}
                                </span>
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

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute bottom-full left-0 w-full bg-white/95 backdrop-blur-sm border rounded-t-2xl py-4 px-6 mb-2">
                    <div className="flex flex-col space-y-4">
                        <NavLinks />
                    </div>
                </div>
            )}
        </header>
    );
}
