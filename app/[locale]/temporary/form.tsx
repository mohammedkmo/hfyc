'use client'

import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useToast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import ReactDOM from 'react-dom/client';
import React from 'react';
import html2canvas from 'html2canvas';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomFileUpload from "@/components/ui/customFileUpload";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface FormValues {
    employees: {
        name: string;
        companyName: string;
        scNumber: string;
        photo: File;
        badgeNumber?: string;
    }[];
}

const formSchema = (t: any) => z.object({
    employees: z.array(
        z.object({
            name: z.string().min(2, t('validation.nameRequired')),
            companyName: z.string().min(2, t('validation.companyNameRequired')),
            scNumber: z.string().min(1, t('validation.scNumberRequired')),
            photo: z.instanceof(File).refine((file) => file.size <= 10000000, t('validation.maxFileSize')),
            badgeNumber: z.string().optional(),
        })
    ),
});

// Add this helper function outside the component
const generateBadgeNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

export default function TemporaryBadgeForm() {
    const locale = useLocale();
    const isRTL = locale === 'ar';
    const { toast } = useToast();
    const formTranslations = useTranslations('temporaryBadge.form');
    const formDescriptions = useTranslations('formDescriptions');

    const [activeTab, setActiveTab] = useState("employee-0");
    const [previewImages, setPreviewImages] = useState<{ [key: number]: string }>({});

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema(formTranslations)),
        defaultValues: {
            employees: [{
                name: "",
                companyName: "",
                scNumber: "",
                photo: null as unknown as File,
                badgeNumber: generateBadgeNumber() // Add initial badge number
            }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "employees",
        control: form.control,
    });

    const addEmployee = () => {
        append({
            name: "",
            companyName: "",
            scNumber: "",
            photo: null as unknown as File,
            badgeNumber: generateBadgeNumber(),
        });
        
        setActiveTab(`employee-${fields.length}`);
    };

    const removeEmployee = (index: number) => {
        remove(index);
        setPreviewImages(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[index];
            // Reindex the remaining previews
            const reindexed: { [key: number]: string } = {};
            Object.entries(newPreviews).forEach(([key, value]) => {
                const numKey = parseInt(key);
                if (numKey > index) {
                    reindexed[numKey - 1] = value;
                } else {
                    reindexed[numKey] = value;
                }
            });
            return reindexed;
        });
        if (fields.length > 1) {
            setActiveTab(`employee-${Math.max(0, index - 1)}`);
        }
    };

    const handlePhotoChange = (file: File, index: number) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImages(prev => ({
                ...prev,
                [index]: reader.result as string
            }));
        };
        reader.onerror = () => {
            console.error('Error reading file');
        };
        reader.readAsDataURL(file);
        form.setValue(`employees.${index}.photo`, file);
    };


    const generatePDF = async (data: FormValues) => {
        // Create hidden container for badges
        const badgesContainer = document.createElement('div');
        badgesContainer.style.position = 'absolute';
        badgesContainer.style.left = '-9999px';
        badgesContainer.style.top = '-9999px';
        document.body.appendChild(badgesContainer);

        console.log(data.employees)

        // Render all badges with QR code data URLs
        badgesContainer.innerHTML = `
            <div class="flex flex-col gap-8" dir="ltr">
                ${Array(Math.ceil(data.employees.length / 4)).fill(null).map((_, pageIndex) => `
                    <div class="flex flex-col w-[210mm] bg-white p-12" style="width: 210mm; height: 297mm;">
                        ${data.employees.slice(pageIndex * 4, (pageIndex + 1) * 4).map((employee, badgeIndex) => `
                            <div class="flex w-full border border-gray-200 rounded-lg overflow-hidden mb-4" style="width: 175mm; height: 60mm;">
                                <!-- Front Side -->
                                <div class="relative w-1/2 bg-white overflow-hidden">
                                    <div class="absolute top-0 left-0 w-full bg-[#B88746] h-10 flex items-center justify-center">
                                        <h2 class="text-white font-bold text-xs">TEMPORARY ACCESS BADGE</h2>
                                    </div>
                                    
                                    <div class="flex gap-2 h-full items-center p-4 mt-4">
                                        <div class="flex flex-col gap-4">
                                            <div class="w-24 h-32 rounded-md overflow-hidden bg-gray-50 border-2 border-[#B88746]">
                                                <img src="${URL.createObjectURL(employee.photo)}" class="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        
                                        <div class="flex flex-col gap-2">
                                            <div class="flex flex-col gap-0">
                                                <label class="text-[5px] font-semibold text-gray-500">FULL NAME</label>
                                                <div class="text-sm font-bold text-gray-900">${employee.name}</div>
                                            </div>
                                            
                                            <div class="flex flex-col gap-0">
                                                <label class="text-[5px] font-semibold text-gray-500">COMPANY</label>
                                                <div class="text-xs font-semibold text-gray-700">${employee.companyName}</div>
                                            </div>
                                            
                                           <div class="flex flex-col gap-0">
                                                <label class="text-[5px] font-semibold text-gray-500">SC Number</label>
                                                <div class="text-[10px] font-semibold text-gray-700">${employee.scNumber}</div>
                                            </div>
                                            
                                            <div class="flex flex-col gap-0">
                                                <label class="text-[5px] font-semibold text-gray-500">EXPIRY DATE</label>
                                                <div class="text-[10px] font-semibold text-gray-700">
                                                    ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="absolute bottom-4 right-4 flex flex-col items-center">
                                            <div id="qr-${pageIndex * 4 + badgeIndex}"></div>
                                            <p class="text-[6px] font-mono text-gray-600">
                                                ${employee.badgeNumber?.match(/.{1,4}/g)?.join(' ') || ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Back Side -->
                                <div class="relative w-1/2 bg-white overflow-hidden">
                                    <div class="absolute top-0 left-0 w-full bg-[#B88746] h-10 flex items-center justify-center">
                                        <h2 class="text-white font-bold text-xs">PCH Only!</h2>
                                    </div>
                                    
                                    <div class="p-8">
                                        <div class="flex flex-col justify-start w-full gap-4 items-end mt-4">
                                            <div class="w-full">
                                                <p class="text-[10px] mb-1">Badging & Access Officer:</p>
                                                <div class="border-b border-gray-300 w-full h-6"></div>
                                            </div>
                                            <div class="w-full space-y-2">
                                                <p class="text-[10px] mb-1">Signature & Stamp:</p>
                                                <div class="border border-gray-300 w-full h-12 rounded"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="w-full text-center text-[8px] text-gray-500 mt-5">
                                            © PetroChina International Iraq FZE
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;

        // Render QR codes
        for (let i = 0; i < data.employees.length; i++) {
            const qrContainer = badgesContainer.querySelector(`#qr-${i}`);
            if (qrContainer) {
                const root = ReactDOM.createRoot(qrContainer);
                root.render(
                    <QRCodeSVG
                        value={data.employees[i].badgeNumber || "vfvdv"}
                        size={40}
                        level="H"
                        marginSize={0}
                    />
                );
            }
        }

        // Wait for QR codes to render
        await new Promise(resolve => setTimeout(resolve, 100));

        // Convert to PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Convert each badge to image and add to PDF
        for (let i = 0; i < Math.ceil(data.employees.length / 4); i++) {
            const page = badgesContainer.children[0].children[i];
            if (page) {
                if (i > 0) {
                    pdf.addPage();
                }

                const canvas = await html2canvas(page as HTMLElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            }
        }

        // Cleanup
        document.body.removeChild(badgesContainer);

        return pdf;
    };


    const onSubmit = async (data: FormValues) => {
        try {
            const zip = new JSZip();

            // Generate PDF
            const pdf = await generatePDF(data);
            zip.file('temporary_badges.pdf', pdf.output('blob'));

            // Generate Excel data
            const excelData = data.employees.map((employee) => ({
                "Badge Number": employee.badgeNumber,
                "Name": employee.name,
                "Company Name": employee.companyName,
                "SC Number": employee.scNumber,
                "Expiry Date": new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString(),
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Temporary Badges");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            zip.file('temporary_badges_register.xlsx', excelBuffer);

            // Generate and download ZIP
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, `temporary_badges_${new Date().toISOString()}.zip`);

            toast({
                title: formTranslations('createZIPSuccess'),
                description: formTranslations('createZIPSuccessDescription')
            });

        } catch (error) {
            console.error(error);
            toast({
                title: formTranslations('createZIPFailed'),
                description: formTranslations('createZIPFailedDescription'),
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        // Cleanup function to revoke object URLs when component unmounts
        return () => {
            Object.values(previewImages).forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [previewImages]);

    return (
        <Card className="rounded-xl shadow-none border">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
                        <TabsList className="flex justify-start gap-x-2 bg-yellow-50 items-center p-2 container overflow-x-scroll h-auto scroll-smooth scrollbar flex-row">
                            {fields.map((field, index) => (
                                <TabsTrigger
                                    key={field.id}
                                    value={`employee-${index}`}
                                    className={cn(buttonVariants({ variant: "outline" }), "rounded-xl bg-blue-50")}
                                >
                                    {field.name || `${formTranslations('employee')} ${index + 1}`}
                                </TabsTrigger>
                            ))}
                            <Button
                                type="button"
                                onClick={addEmployee}
                                variant="outline"
                                className="ml-2 rounded-xl"
                            >
                                + {formTranslations('addEmployee')}
                            </Button>
                        </TabsList>

                        {fields.map((field, index) => (
                            <TabsContent key={field.id} value={`employee-${index}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                                    

                                    {/* Form Fields */}
                                    <div className="space-y-6">
                                        <CardHeader className="p-0">
                                            <div className="flex justify-between items-center">
                                                <CardTitle>{formTranslations('employee')} {index + 1}</CardTitle>
                                                {fields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => removeEmployee(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name={`employees.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{formTranslations('name')}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} className="rounded-lg" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            
                                            <FormField
                                                control={form.control}
                                                name={`employees.${index}.companyName`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{formTranslations('companyName')}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} className="rounded-lg" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            
                                            <FormField
                                                control={form.control}
                                                name={`employees.${index}.scNumber`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{formTranslations('scNumber')}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} className="rounded-lg" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            
                                            <FormField
                                                control={form.control}
                                                name={`employees.${index}.photo`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{formTranslations('photo')}</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        field.onChange(file);
                                                                        handlePhotoChange(file, index);
                                                                    }
                                                                }}
                                                                className="rounded-lg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>


                                    {/* Badge Preview */}
                                    <div dir="ltr" className="relative w-full aspect-[3/2] bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 overflow-hidden">
                                        {/* Official header */}
                                        <div className="absolute top-0 left-0 w-full bg-yellow-600 h-12 flex items-center justify-center">
                                            <h2 className="text-white font-bold text-lg">TEMPORARY ACCESS BADGE</h2>
                                        </div>

                                          {/* QR Code */}
                                          <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2">
                                                    <QRCodeSVG
                                                        value={form.watch(`employees.${index}.badgeNumber`) || ""}
                                                        size={100}
                                                        level="H"
                                                        includeMargin={true}
                                                    />
                                                      <p className="text-xs font-mono text-gray-600">
                                                        {form.watch(`employees.${index}.badgeNumber`)?.match(/.{1,4}/g)?.join(' ') || ''}
                                                      </p>
                                                </div>
                                        
                                        <div className="flex gap-8 h-full items-center relative z-10 mt-4">
                                            
                                            {/* Left side: Photo and QR */}
                                            <div className="flex flex-col gap-4">
                                                {/* Photo container */}
                                                <div className="w-36 h-44 rounded-md overflow-hidden bg-gray-50 border-2 border-yellow-600">
                                                    {previewImages[index] ? (
                                                        <img 
                                                            src={previewImages[index]} 
                                                            alt="Official ID Photo" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-yellow-600">
                                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            
                                            </div>
                                            
                                            {/* Information */}
                                            <div className="flex flex-col gap-2">

                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500">FULL NAME</label>
                                                    <div className="text-xl font-bold text-gray-900">
                                                        {form.watch(`employees.${index}.name`) || "Employee Name"}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500">COMPANY</label>
                                                    <div className="text-lg font-semibold text-gray-700">
                                                        {form.watch(`employees.${index}.companyName`) || "Company Name"}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500">SC Number</label>
                                                    <div className="text-sm font-semibold text-gray-700">
                                                        {form.watch(`employees.${index}.scNumber`) || "Security Clearance Number"}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500">EXPIRY DATE</label>
                                                    <div className="text-sm font-semibold text-gray-700">
                                                        {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <CardFooter className="py-4 border-t">
                        <Button className="w-full sm:w-auto" type="submit">
                            {formTranslations('generateBadges')}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}