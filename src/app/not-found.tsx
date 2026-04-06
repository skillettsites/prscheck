import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { BookDemoButton } from "@/components/DemoPopup";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-4 pt-16">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-7xl font-bold text-accent-500">404</p>
          <h1 className="mt-4 text-3xl font-bold text-white">
            Page not found
          </h1>
          <p className="mt-4 text-lg text-navy-300">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-500 hover:shadow-lg hover:shadow-accent-600/25"
            >
              Go to homepage
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg border border-navy-700 px-6 py-3 text-sm font-semibold text-navy-300 transition-all hover:border-navy-600 hover:text-white"
            >
              Contact us
            </Link>
          </div>

          <div className="mt-16 border-t border-navy-800 pt-8">
            <p className="text-sm font-semibold text-navy-400">
              Explore PRSCheck
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
              <Link
                href="/solutions"
                className="text-navy-400 transition-colors hover:text-accent-400"
              >
                Solutions
              </Link>
              <Link
                href="/pricing"
                className="text-navy-400 transition-colors hover:text-accent-400"
              >
                Pricing
              </Link>
              <Link
                href="/solutions/hmo-detection"
                className="text-navy-400 transition-colors hover:text-accent-400"
              >
                HMO Detection
              </Link>
              <Link
                href="/solutions/compliance-screening"
                className="text-navy-400 transition-colors hover:text-accent-400"
              >
                Compliance Screening
              </Link>
              <Link
                href="/solutions/prs-database"
                className="text-navy-400 transition-colors hover:text-accent-400"
              >
                PRS Database
              </Link>
              <Link
                href="/api-docs"
                className="text-navy-400 transition-colors hover:text-accent-400"
              >
                API Docs
              </Link>
              <BookDemoButton className="text-navy-400 transition-colors hover:text-accent-400">
                Book a Demo
              </BookDemoButton>
              <Link
                href="/about"
                className="text-navy-400 transition-colors hover:text-accent-400"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
