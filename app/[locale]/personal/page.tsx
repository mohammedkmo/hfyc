import Image from "next/image";
import { Metadata } from "next";
import PersonalBadgeForm from "./form";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export const metadata: Metadata = {
  title: "Personal Badge",
  description: "Applying for Personal Badges",
}

export default function PersonalBadgePage() {
  const t = useTranslations('personalBadge');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const isRTL = locale === 'ar'; // Assuming 'ar' is the RTL language code

  return (
      <div className="w-full flex items-center justify-center py-10 pb-32 bg-gradient-to-t from-white to-blue-100 min-h-[85vh]">
        <div className="container rounded-2xl bg-white p-6">
          <div className={`mb-5 w-full md:w-8/12 relative`}>
            <Image 
              src={isRTL ? '/arrow-rtl.svg' : '/arrow.svg'}
              className={`absolute top-7 hidden md:block ${isRTL ? 'left-[-12rem]' : 'right-[-11rem]'}`} 
              alt="PCH Logo" 
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
          <PersonalBadgeForm />
        </div>
      </div>
  );
}
