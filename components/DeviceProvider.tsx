'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BanIcon } from 'lucide-react';

interface DeviceContextType {
  isMobile: boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslations('common');

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768); // Adjust this value as needed
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center p-4 z-50">
        <div className=" rounded-lg p-6 text-center max-w-md flex flex-col items-center">
           <BanIcon className="w-10 h-10 mb-4" />
          <h2 className="text-xl font-bold mb-4">{t('mobileNotSupported')}</h2>
          <p>{t('pleaseUseComputer')}</p>
        </div>
      </div>
    );
  }

  return <DeviceContext.Provider value={{ isMobile }}>{children}</DeviceContext.Provider>;
};

export default DeviceProvider;
