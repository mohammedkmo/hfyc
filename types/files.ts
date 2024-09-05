export interface ImageFile {
  originalName: string;
  newName?: string;
  data: string;
  file: File;
}


export interface Mapping {
  [key: string]: string; // Key is HFYC Number, value is FirstName_LastName
}

export interface ExcelRow {
  "HFYC Number": string;
  "First Name": string;
  "Last Name": string;
}