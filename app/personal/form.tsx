"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FormValues, formSchema } from "@/schema/employee";
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

export default function PersonalBadgeForm() {

    const [activeTab, setActiveTab] = useState("employee-0");
    const [tabTitle, setTabTitle] = useState('');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employees: [{}],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "employees",
        control: form.control,
    });

    const addEmployee = () => {
        append({
            id: "",
            firstName: "",
            lastName: "",
            contractor: "",
            position: "",
            idDocumentNumber: "",
            nationality: "",
            subcontractor: "",
            associatedPetroChinaContractNumber: "",
            contractHoldingPetroChinaDepartment: "",
            eaLetterNumber: "",
            numberInEaList: "",
            photo: null as unknown as File,
            idDocument: null as unknown as File,
            drivingLicense: undefined,
            moiCard: undefined,
        });
        setActiveTab(`employee-${fields.length}`);
    };

    const removeEmployee = (index: number) => {
        remove(index);
        if (fields.length > 1) {
            setActiveTab(`employee-${Math.max(0, index - 1)}`);
        }
    };

    const onSubmit = async (data: FormValues) => {
        const zip = new JSZip();

        // Create folders
        const photosFolder = zip.folder("Photos");
        const idDocsFolder = zip.folder("ID Documents");
        const drivingLicensesFolder = zip.folder("Driving Licences");
        const moiCardsFolder = zip.folder("MOI Cards");

        // Prepare Excel data
        const excelData = data.employees.map((employee, index) => {
            const badgeNumber = `HFYC${employee.id}`;
            const photoName = `${employee.firstName}+${employee.lastName}_${badgeNumber}.jpg`;
            const idName = `${badgeNumber}-ID Document.jpg`;
            const drivingLicenseName = employee.drivingLicense
                ? `${badgeNumber}-Driving License.jpg`
                : null;

            const moiCardName = employee.moiCard
                ? `${badgeNumber}-MOI Card.jpg`
                : null;

            // Add files to ZIP
            photosFolder!.file(photoName, employee.photo);
            idDocsFolder!.file(idName, employee.idDocument);
            if (employee.drivingLicense) {
                if (drivingLicenseName) {
                    drivingLicensesFolder!.file(
                        drivingLicenseName,
                        employee.drivingLicense
                    );
                }
            }
            if (employee.moiCard) {
                if (moiCardName) {
                    moiCardsFolder!.file(moiCardName, employee.moiCard);
                }
            }

            // Return employee data for Excel
            return {
                "ID": badgeNumber,
                "First Name": employee.firstName,
                "Last Name": employee.lastName,
                "Department": `HALFAYA/Contractor/${employee.contractor}`,
                "Start Time of Effective Period": formatDate(new Date()),
                "End Time of Effective Period": formatDate(new Date()),
                "Enrollment Date": formatDate(new Date()),
                "Type": "Basic Person",
                "Company Name": employee.contractor,
                "Subcontractor Name": employee.subcontractor,
                "ID Document Number": employee.idDocumentNumber,
                "Nationality": employee.nationality,
                "System Credential Number": "",
                "Associated PCH Contract Number":
                    employee.associatedPetroChinaContractNumber,
                "Contract Holding PCH Department":
                    employee.contractHoldingPetroChinaDepartment,
                "Comments": "",
                "EA Letter Number": employee.eaLetterNumber,
                "Number in EA List": employee.numberInEaList,
                "Access Revoked": "NO",
                "Position-": employee.position,
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
        zip.file(`${excelData[0]["Company Name"]} - ${excelData.length} employees register.xlsx`, excelBuffer);

        // Generate ZIP file and trigger download
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `${excelData[0]["Company Name"]} - ${excelData.length} employees register.zip`);
    };


    return (
        <Card className=" rounded-xl rounded-t-none border-t-0 shadow-none ">
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
                                    value={`employee-${index}`}
                                >
                                    {field.firstName || field.lastName
                                        ? field.firstName + " " + field.lastName
                                        : `Employee ${index + 1}`}
                                </TabsTrigger>
                            ))}
                            <Button
                                type="button"
                                onClick={addEmployee}
                                variant="outline"
                                className="ml-2 rounded-xl"
                            >
                                + Add Employee
                            </Button>
                        </TabsList>
                        {fields.map((field: any, index: any) => (
                            <TabsContent
                                key={field.id}
                                value={`employee-${index}`}
                                className="mt-0 rounded-xl "
                            >

                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Employee {index + 1} Details</CardTitle>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="rounded-xl"
                                            size="icon"
                                            onClick={() => removeEmployee(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className=" grid grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.id`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>Badge number</FormLabel>
                                                            <div className="flex">
                                                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-xl">
                                                                    HFYC-
                                                                </span>
                                                                <FormControl>
                                                                    <Input
                                                                        className="rounded-l-none"
                                                                        maxLength={4}
                                                                        onInput={(e) => {
                                                                            const inputElement =
                                                                                e.target as HTMLInputElement;
                                                                            inputElement.value =
                                                                                inputElement.value.replace(
                                                                                    /[^0-9]/g,
                                                                                    ""
                                                                                );
                                                                        }}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </div>
                                                            <FormDescription>
                                                                Enter the HFYC number provided by the PCH
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.firstName`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>First Name</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Enter the first name of the employee
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.lastName`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>Last Name</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Enter the last name of the employee
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className=" grid grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.contractor`}
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
                                                    name={`employees.${index}.position`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>Position</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Enter the position of the employee
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.idDocumentNumber`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>ID Document Number</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Enter the ID document number of the employee
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className=" grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.nationality`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>Nationality</FormLabel>

                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select nationality" />
                                                                    </SelectTrigger>
                                                                </FormControl>

                                                                <SelectContent>
                                                                    {nationalities.map((nationality) => (
                                                                        <SelectItem
                                                                            key={nationality.num_code}
                                                                            value={nationality.nationality}
                                                                        >
                                                                            {nationality.nationality}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormDescription>
                                                                Select employee Nationality
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.subcontractor`}
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
                                            </div>
                                            <div className=" grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.associatedPetroChinaContractNumber`}
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
                                                    name={`employees.${index}.contractHoldingPetroChinaDepartment`}
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
                                                    name={`employees.${index}.eaLetterNumber`}
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
                                                    name={`employees.${index}.numberInEaList`}
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
                                                    name={`employees.${index}.photo`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>Photo</FormLabel>
                                                            <FormControl>
                                                                <CustomFileUpload
                                                                    initialFile={field.value}
                                                                    onChange={(file: any) =>
                                                                        form.setValue(
                                                                            `employees.${index}.photo`,
                                                                            file
                                                                        )
                                                                    }
                                                                    label="Upload Photo"
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Upload a photo of the employee
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.idDocument`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>ID Document</FormLabel>
                                                            <FormControl>
                                                                <CustomFileUpload
                                                                    initialFile={field.value}
                                                                    onChange={(file: any) =>
                                                                        form.setValue(
                                                                            `employees.${index}.idDocument`,
                                                                            file
                                                                        )
                                                                    }
                                                                    label="Upload ID Document"
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Upload the ID document of the employee
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.drivingLicense`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Driving License --- if applicable
                                                            </FormLabel>
                                                            <FormControl>
                                                                <CustomFileUpload
                                                                    initialFile={field.value}
                                                                    onChange={(file: any) => {
                                                                        form.setValue(
                                                                            `employees.${index}.drivingLicense`,
                                                                            file || undefined
                                                                        );
                                                                    }}
                                                                    label="Upload Driving License"
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Upload the driving license of the employee
                                                                if the employee is a driver
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`employees.${index}.moiCard`}
                                                    render={({ field }: { field: any }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                MOI Card --- if applicable
                                                            </FormLabel>
                                                            <FormControl>
                                                                <CustomFileUpload
                                                                    initialFile={field.value}
                                                                    onChange={(file: any) => {
                                                                        form.setValue(
                                                                            `employees.${index}.moiCard`,
                                                                            file || undefined
                                                                        );
                                                                    }}
                                                                    label="Upload MOI Card"
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Upload the MOI card of the employee if the employee is a driver and working with a security company
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                            </TabsContent>
                        ))}
                    </Tabs>

                    <CardFooter className=" py-4 border-t">
                        <Button className="" type="submit">Generate ZIP</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}