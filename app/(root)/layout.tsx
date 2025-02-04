import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { Toaster } from "@/components/ui/toaster";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col max-w-7xl mx-auto">
      <Header />
      <main
        className="flex-1"
      >
        {children}
      </main>
      <Toaster />
      <Footer />
    </div>
  );
}
