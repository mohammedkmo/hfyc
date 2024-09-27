"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm, useFieldArray } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Trash2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { vehicleSchema, formSchema, FormValues } from "@/schema/vehicle";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { nationalities } from "@/data/nationalities";
import CustomFileUpload from "@/components/ui/customFileUpload";
import { formatDate } from "@/lib/helpers";
import Image from "next/image";
import { provinces } from "@/data/provinces";




export default function VehiclesBadgePage() {
    const [activeTab, setActiveTab] = useState("vehicle-0");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vehicles: [{}],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "vehicles",
        control: form.control,
    });

    const addVehicle = () => {
        append({
            fleetNumber: "",
            make: "",
            model: "",
            contractor: "",
            position: "",
            senewiyahNumber: "",
            province: "",
            subcontractor: "",
            associatedPetroChinaContractNumber: "",
            contractHoldingPetroChinaDepartment: "",
            eaLetterNumber: "",
            numberInEaList: "",
            photo: null as unknown as File,
            senewiyah: null as unknown as File,
            wekala: undefined,
            armoredVehicleCertificate: undefined,
        });
        setActiveTab(`vehicle-${fields.length}`);
    };

    const removeVehicle = (index: number) => {
        remove(index);
        if (fields.length > 1) {
            setActiveTab(`vehicle-${Math.max(0, index - 1)}`);
        }
    };

    const onSubmit = async (data: FormValues) => {
        const zip = new JSZip();

        // Create folders
        const vehiclePhotosFolder = zip.folder("Vehicle Photos");
        const senewiyahsFolder = zip.folder("Senewiyahs");
        const wakalaFolder = zip.folder("Wakala");
        const armoredVehicleCertificatesFolder = zip.folder("Armored Vehicle Certificates");

        // Prepare Excel data
        const excelData = data.vehicles.map((vehicle, index) => {
            const photoName = `${vehicle.fleetNumber}.jpg`;
            const senewiyahName = `${vehicle.fleetNumber}-Senewiyah.jpg`;

            const wekalaName = vehicle.wekala
                ? `${vehicle.fleetNumber}-Wekala.jpg`
                : null;

            const armoredVehicleCertificateName = vehicle.armoredVehicleCertificate
                ? `${vehicle.fleetNumber}-Armored Certificate.jpg`
                : null;

            // Add files to ZIP
            vehiclePhotosFolder!.file(photoName, vehicle.photo);
            senewiyahsFolder!.file(senewiyahName, vehicle.senewiyah);
            if (vehicle.wekala) {
                if (wekalaName) {
                    wakalaFolder!.file(
                        wekalaName,
                        vehicle.wekala
                    );
                }
            }
            if (vehicle.armoredVehicleCertificate) {
                if (armoredVehicleCertificateName) {
                    armoredVehicleCertificatesFolder!.file(armoredVehicleCertificateName, vehicle.armoredVehicleCertificate);
                }
            }

            // Return employee data for Excel
            return {
                "ID": vehicle.fleetNumber,
                "First Name": vehicle.make,
                "Last Name": vehicle.model,
                "Department": `HALFAYA/Contractor/${vehicle.contractor}`,
                "Start Time of Effective Period": formatDate(new Date()),
                "End Time of Effective Period": formatDate(new Date()),
                "Enrollment Date": formatDate(new Date()),
                "Type": "Basic Person",
                "isVehicle": "YES",
                "Position": vehicle.position,
                "Company Name": vehicle.contractor,
                "Subcontractor Name": vehicle.subcontractor,
                "ID Document Number": vehicle.senewiyahNumber,
                "System Credential Number": "",
                "Associated PCH Contract Number":
                    vehicle.associatedPetroChinaContractNumber,
                "Contract Holding PCH Department":
                    vehicle.contractHoldingPetroChinaDepartment,
                "Comments": "",
                "EA Letter Number": vehicle.eaLetterNumber,
                "Number in EA List": vehicle.numberInEaList,
                "Access Revoked": "NO",
                "Sponsor Badge": "NO",
            };
        });

        const headerText = [
            ["Rule"],
            ["At least one of family name and given name is required."],
            ["Once configured, the ID cannot be edited. Confirm the ID rule before setting an ID."],
            ["Do NOT change the layout and column title in this template file. The importing may fail if changed."],
            ["You can add persons to an existing departments. The department names should be separated by/. For example, import persons to Department A in All Departments. Format: All Departments/Department A."],
            ["Start Time of Effective Period is used for Access Control Module and Time & Attendance Module. Format: yyyy/mm/dd hh:mm:ss."],
            ["End Time of Effective Period is used for Access Control Module and Time & Attendance Module. Format: yyyy/mm/dd hh:mm:ss."],
            ["The platform does not support adding or editing basic information (including ID, first name, last name, phone number, and remarks) about domain persons and domain group persons and the information about domain persons linked to person information."],
            ["It supports editing the persons' additional information in a batch, the fields of which are already created in the system. Please enter the additional information according to the type. For single selection type, select one from the drop-down list."]
        ];

        const headers = [
            "ID",
            "First Name",
            "Last Name",
            "Department",
            "Start Time of Effective Period",
            "End Time of Effective Period",
            "Enrollment Date",
            "Type",
            "Company Name",
            "Subcontractor Name",
            "ID Document Number",
            "Nationality",
            "System Credential Number",
            "Associated PCH Contract Number",
            "Contract Holding PCH Department",
            "Comments",
            "EA Letter Number",
            "Number in EA List",
            "Access Revoked",
            "Position-",
            "Sponsor Badge",
        ];

        const combinedData = [...headerText, headers, ...excelData.map(Object.values)];

        const worksheet = XLSX.utils.aoa_to_sheet(combinedData);


        // Calculate column widths based on headers and add a little extra width
        const colWidths = headers.map(header => ({ wch: header.length + 10 }));

        // Set column widths
        worksheet['!cols'] = colWidths;


        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Register");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        // Add Excel file to ZIP
        zip.file(`${excelData[0]["Company Name"]} - ${excelData.length} Vehicles register.xlsx`, excelBuffer);

        // Generate ZIP file and trigger download
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `${excelData[0]["Company Name"]} - ${excelData.length} Vehicles register.zip`);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center py-10 bg-orange-50/50">
            <div className=" container">
                <div className="mb-5 w-full md:w-8/12 relative">
                    <Image src="/arrow.svg" className="absolute top-2 -right-52 hidden md:block" alt="PCH Logo" width={200} height={200} />

                    <h1 className=" font-bold">Applying for Vehicle Badges</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Please fill in the vehicle details and upload the required documents. This process is entirely client-side, ensuring no data is stored on our server. Once completed, download the ZIP file and send it, along with the necessary security clearance, to the PCH Badging Office at the provided email address. Thank you for your cooperation.
                        <br />
                        Email: <a href="mailto:pch-badging@petrochina-hfy.com" className="text-blue-500">pch-badging@petrochina-hfy.com</a>
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <TabsList className="flex justify-start items-center p-2 container overflow-x-scroll h-auto scroll-smooth scrollbar rounded-xl border border-b-0 rounded-b-none">
                                {fields.map((field: any, index: any) => (
                                    <TabsTrigger
                                        className="rounded-lg h-auto"
                                        key={field.id}
                                        value={`vehicle-${index}`}
                                    >
                                        {field.fleetNumber
                                            ? field.fleetNumber
                                            : `Vehicle ${index + 1}`}
                                    </TabsTrigger>
                                ))}
                                <Button
                                    type="button"
                                    onClick={addVehicle}
                                    variant="outline"
                                    className="ml-2 rounded-xl"
                                >
                                    + Add Vehicle
                                </Button>
                            </TabsList>
                            {fields.map((field: any, index: any) => (
                                <TabsContent
                                    key={field.id}
                                    value={`vehicle-${index}`}
                                    className="mt-0 rounded-xl "
                                >
                                    <Card className=" rounded-xl rounded-t-none border-t-0 shadow-none ">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle>Vehicle {index + 1} Details</CardTitle>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="rounded-xl"
                                                    size="icon"
                                                    onClick={() => removeVehicle(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className=" grid grid-cols-4 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.fleetNumber`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>Fleet Number</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>

                                                                    <FormDescription>
                                                                        Enter the Plate Number of the vehicle
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.province`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>Province</FormLabel>

                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        defaultValue={field.value}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select province" />
                                                                            </SelectTrigger>
                                                                        </FormControl>

                                                                        <SelectContent>
                                                                            {provinces.map((province) => (
                                                                                <SelectItem
                                                                                    key={province.id}
                                                                                    value={province.name}
                                                                                >
                                                                                    {province.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormDescription>
                                                                        Select the province of the vehicle
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.make`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>Make</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enter the Make of the vehicle (Example: Toyota)
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.model`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>Model</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enter the Model of the vehicle (Example: Pickup)
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className=" grid grid-cols-3 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.contractor`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>Contractor Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enter the name of your company
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                         <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.subcontractor`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        SubContractor --- if applicable
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enter the subContractor name if applicable
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.senewiyahNumber`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>Senewiyah Number</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enter the Senewiyah Number of the vehicle
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className=" grid grid-cols-2 gap-4">
                                                        
                                                       
                                                    </div>
                                                    <div className=" grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.associatedPetroChinaContractNumber`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Associated PetroChina Contract Number
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enter the associated PetroChina contract
                                                                        number
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.contractHoldingPetroChinaDepartment`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Contract Holding PetroChina Department
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enter the contract holding PetroChina
                                                                        department
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className=" grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.eaLetterNumber`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>EA Letter Number</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enter the EA letter number
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.numberInEaList`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>Number in EA List</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Enter the number in the EA list
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className=" grid grid-cols-4 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.photo`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>Photo</FormLabel>
                                                                    <FormControl>
                                                                        <CustomFileUpload
                                                                            initialFile={field.value}
                                                                            onChange={(file: any) =>
                                                                                form.setValue(
                                                                                    `vehicles.${index}.photo`,
                                                                                    file
                                                                                )
                                                                            }
                                                                            label="Upload Photo"
                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Upload a photo of the vehicle
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.senewiyah`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>Senewiyah</FormLabel>
                                                                    <FormControl>
                                                                        <CustomFileUpload
                                                                            initialFile={field.value}
                                                                            onChange={(file: any) =>
                                                                                form.setValue(
                                                                                    `vehicles.${index}.senewiyah`,
                                                                                    file
                                                                                )
                                                                            }
                                                                            label="Upload Senewiyah"
                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Upload the Senewiyah of the vehicle
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.wekala`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Wekala --- if applicable
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <CustomFileUpload
                                                                            initialFile={field.value}
                                                                            onChange={(file: any) => {
                                                                                form.setValue(
                                                                                    `vehicles.${index}.wekala`,
                                                                                    file || undefined
                                                                                );
                                                                            }}
                                                                            label="Upload Wekala"
                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Upload the Wekala of the vehicle
                                                                        if the Senewiyah is not under the contractor Name
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`vehicles.${index}.armoredVehicleCertificate`}
                                                            render={({ field }: { field: any }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Armored Certificate --- if applicable
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <CustomFileUpload
                                                                            initialFile={field.value}
                                                                            onChange={(file: any) => {
                                                                                form.setValue(
                                                                                    `vehicles.${index}.armoredVehicleCertificate`,
                                                                                    file || undefined
                                                                                );
                                                                            }}
                                                                            label="Upload Armored Vehicle Certificate"
                                                                        />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Upload the Armored Vehicle Certificate of the vehicle if the vehicle is armored
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>

                        <div className=" mt-4">
                            <Button type="submit">Generate ZIP</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
