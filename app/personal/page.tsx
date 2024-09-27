import Image from "next/image";
import { Metadata } from "next";
import PersonalBadgeForm from "./form";

export const metadata: Metadata = {
  title: "Personal Badge",
  description: "Applying for Personal Badges",
}

export default function PersonalBadgePage() {
  

  return (
      <div className="min-h-screen w-full flex items-center justify-center py-10 pb-20 bg-blue-50/50">
        <div className=" container">
          <div className="mb-5 w-full md:w-8/12 relative">
          <Image src="/arrow.svg" className="absolute top-6 -right-40 hidden md:block" alt="PCH Logo" width={200} height={200} />

            <h1 className=" font-bold">Applying for Personal Badges</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Please fill in the employee details and upload the required documents. This process is entirely client-side, ensuring no data is stored on our server. Once completed, download the ZIP file and send it, along with the necessary security clearance, to the PCH Badging Office at the provided email address. Thank you for your cooperation.
              <br />
              Email: <a href="mailto:contractor-badging@petrochina-hfy.com" className="text-blue-500">contractor-badging@petrochina-hfy.com</a>
            </p>
          </div>
          <PersonalBadgeForm />
        </div>
      </div>
  );
}
