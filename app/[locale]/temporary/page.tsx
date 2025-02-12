import { Metadata } from "next";
import TemporaryBadgeForm from "./form";
import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import Image from "next/image";

export const metadata: Metadata = {
    title: "Temporary Badge",
    description: "Generate Temporary Badges",
}

export default async function TemporaryBadgePage() {
    const t = await getTranslations('temporaryBadge');
    const commonT = await getTranslations('common');
    const locale = await getLocale();
    const isRTL = locale === 'ar';

    return (
        <div className="w-full flex items-center justify-center py-10 pb-32 bg-gradient-to-t from-white to-yellow-100 min-h-[85vh]">
            <div className="container rounded-2xl bg-white p-6">
                <div className={`mb-5 w-full md:w-8/12 relative`}>
                    <Image
                        src={isRTL ? '/arrow-rtl.svg' : '/arrow.svg'}
                        className={`absolute top-7 hidden md:block ${isRTL ? 'left-[-12rem]' : 'right-[-11rem]'}`}
                        alt="arrow"
                        width={180}
                        height={180}
                        draggable="false"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    />

                    <h1 className="font-bold text-2xl">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('description')}
                        <br />
                        {commonT('email')} <a href={`mailto:${commonT('emailAddress')}`} className="text-blue-500">{commonT('emailAddress')}</a>
                    </p>
                </div>
                <TemporaryBadgeForm />
            </div>
        </div>
    );
}