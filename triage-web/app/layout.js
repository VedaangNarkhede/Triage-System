import "./globals.css";
import Link from 'next/link';

export const metadata = {
  title: "AI Triage System",
  description: "Intelligent Triage & Decision Support System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <header className="bg-brand-primary text-white shadow-md">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold tracking-wider">ORTHOC</div>
            <nav className="space-x-8 text-sm font-medium uppercase tracking-wide">
              <Link href="/" className="hover:text-brand-accent transition-colors">Home</Link>
              <Link href="/patient/new" className="hover:text-brand-accent transition-colors">New Patient</Link>
              <Link href="/doctor/dashboard" className="hover:text-brand-accent transition-colors">Dashboard</Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-brand-dark text-white py-8">
          <div className="container mx-auto px-6 text-center text-sm text-gray-300">
            &copy; {new Date().getFullYear()} AI-Powered Intelligent Triage & Decision Support System.
          </div>
        </footer>
      </body>
    </html>
  );
}
