import { z } from "zod";

export const employeeSchema = z.object({
    id: z.string().min(1, "Badge number is required"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    contractor: z.string().min(2, "Contractor must be at least 2 characters"),
    position: z.string().min(2, "Position must be at least 2 characters"),
    idDocumentNumber: z.string().min(1, "ID Document Number is required"),
    nationality: z.string().min(2, "Nationality must be at least 2 characters"),
    subcontractor: z
      .string()
      .min(2, "Subcontractor must be at least 2 characters"),
    associatedPetroChinaContractNumber: z
      .string()
      .min(1, "Associated PetroChina Contract Number is required"),
    contractHoldingPetroChinaDepartment: z
      .string()
      .min(1, "Contract Holding PetroChina Department is required"),
    eaLetterNumber: z.string().min(1, "EA Letter Number is required"),
    numberInEaList: z.string().min(1, "Number in EA List is required"),
    photo: z
      .instanceof(File)
      .refine((file) => file.size <= 10000000, `Max file size is 10MB.`),
    idDocument: z
      .instanceof(File)
      .refine((file) => file.size <= 10000000, `Max file size is 10MB.`),
    drivingLicense: z.instanceof(File).optional(),
  });


  export const formSchema = z.object({
    employees: z
      .array(employeeSchema)
      .min(1, "At least one employee is required"),
  });
  
  export type FormValues = z.infer<typeof formSchema>;