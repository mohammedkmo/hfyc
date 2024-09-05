import { ExcelRow, Mapping } from "@/types/files";
import * as XLSX from "xlsx";

// Handle Excel file upload and parse it
export const handleExcelUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  setMappings: React.Dispatch<React.SetStateAction<Mapping>>
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

    // Convert Excel data to a mapping object
    const mappingObj: Mapping = {};
    excelData.forEach((row) => {
      const id = row["HFYC Number"];
      const firstName = row["First Name"];
      const lastName = row["Last Name"];
      mappingObj[id] = `${firstName}+${lastName}`;
    });

    setMappings(mappingObj);
  };

  reader.readAsArrayBuffer(file);
};