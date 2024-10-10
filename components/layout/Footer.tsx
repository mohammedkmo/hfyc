

export default function Footer() {
    return (
        <footer className="bg-white text-black border-t py-4">
            <div className="container mx-auto">
                <p className="text-center">&copy; {new Date().getFullYear()} PCH Badging. All rights reserved.</p>
            </div>
        </footer>
    );
}