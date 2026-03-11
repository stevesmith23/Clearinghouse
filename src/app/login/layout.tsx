export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e2a5c] via-[#143A82] to-[#1e4a9a]">
            {children}
        </div>
    );
}
