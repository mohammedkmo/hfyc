"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
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

export default function Component() {
  const [activeTab, setActiveTab] = useState("employee-0");

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
      photo: File,
      idDocument: File,
      drivingLicense: File,
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

    // Prepare Excel data
    const excelData = data.employees.map((employee, index) => {
      const badgeNumber = `HFYC${employee.id}`;
      const photoName = `${employee.firstName}+${employee.lastName}_${badgeNumber}.jpg`;
      const idName = `${badgeNumber}-ID Document.jpg`;
      const drivingLicenseName = employee.drivingLicense
        ? `${badgeNumber}-Driving License.jpg`
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

      // Return employee data for Excel
      return {
        id: badgeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        contractor: employee.contractor,
        position: employee.position,
        idDocumentNumber: employee.idDocumentNumber,
        nationality: employee.nationality,
        subContractor: employee.subcontractor,
        associatedPetroChinaContractNumber:
          employee.associatedPetroChinaContractNumber,
        contractHoldingPetroChinaDepartment:
          employee.contractHoldingPetroChinaDepartment,
        eaLetterNumber: employee.eaLetterNumber,
        numberInEaList: employee.numberInEaList,
        photo: photoName,
        idDocument: idName,
        drivingLicense: drivingLicenseName,
      };
    });

    // Create Excel file
    const worksheet = XLSX.utils.json_to_sheet(excelData, {
      header: [
        "id",
        "firstName",
        "lastName",
        "contractor",
        "position",
        "idDocumentNumber",
        "nationality",
        "subContractor",
        "associatedPetroChinaContractNumber",
        "contractHoldingPetroChinaDepartment",
        "eaLetterNumber",
        "numberInEaList",
        "photo",
        "idDocument",
        "drivingLicense",
      ],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Register");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Add Excel file to ZIP
    zip.file("employees.xlsx", excelBuffer);

    // Generate ZIP file and trigger download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${excelData.length} employees request.zip`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100">
      <div className=" container">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex justify-start items-center container overflow-x-scroll h-auto scroll-smooth rounded-xl border border-b-0 rounded-b-none">
                {fields.map((field: any, index: any) => (
                  <TabsTrigger
                    className="rounded-xl"
                    key={field.id}
                    value={`employee-${index}`}
                  >
                    Employee {index + 1}
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
                  className="mt-0 rounded-xl"
                >
                  <Card className=" rounded-xl rounded-t-none border-t-0">
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
                                        {...field}
                                      />
                                    </FormControl>
                                  </div>
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
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`employees.${index}.subcontractor`}
                              render={({ field }: { field: any }) => (
                                <FormItem>
                                  <FormLabel>Subcontractor</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
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
                                    <Input {...field} />
                                  </FormControl>
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
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className=" grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`employees.${index}.photo`}
                              render={({ field }: { field: any }) => (
                                <FormItem>
                                  <FormLabel>Photo</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        form.setValue(
                                          `employees.${index}.photo`,
                                          file
                                        );
                                      }}
                                    />
                                  </FormControl>
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
                                    <Input
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        form.setValue(
                                          `employees.${index}.idDocument`,
                                          file
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`employees.${index}.drivingLicense`}
                              render={({ field }: { field: any }) => (
                                <FormItem>
                                  <FormLabel>Driving License</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        form.setValue(
                                          `employees.${index}.drivingLicense`,
                                          file
                                        );
                                      }}
                                    />
                                  </FormControl>
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
