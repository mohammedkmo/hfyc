import { z } from "zod";

export const vehicleSchema = z.object({
    fleetNumber: z.string().min(1, "Badge number is required"),
    make: z.string().min(2, "First name must be at least 2 characters"),
    model: z.string().min(2, "Last name must be at least 2 characters"),
    contractor: z.string().min(2, "Contractor must be at least 2 characters"),
    position: z.string().min(2, "Position must be at least 2 characters"),
    senewiyahNumber: z.string().min(1, "ID Document Number is required"),
    province: z.string().min(2, "Province must be at least 2 characters"),
    isVehicle: z.string().optional(),
    subcontractor: z
      .string()
      .min(2, "Subcontractor must be at least 2 characters").optional(),
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
    senewiyah: z
      .instanceof(File)
      .refine((file) => file.size <= 10000000, `Max file size is 10MB.`),
    wekala: z.instanceof(File).optional(),
    armoredVehicleCertificate: z.instanceof(File).refine((file) => file.size <= 10000000, `Max file size is 10MB.`).optional(),
});

export const formSchema = z.object({
    vehicles: z
      .array(vehicleSchema)
      .min(1, "At least one employee is required"),
  }); 

export type FormValues = z.infer<typeof formSchema>;