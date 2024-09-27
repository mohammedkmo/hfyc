import Image from "next/image";

export default function Header() {

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
            <div className="container mx-auto flex items-center justify-between py-4">
                <Image src="/logo.png" alt="PCH Logo" width={120} height={120} />

            </div>
        </header>
    );
}
