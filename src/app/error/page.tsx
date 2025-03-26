"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams?.get("message") || "An unknown error occurred";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{errorMessage}</p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Sorry, we encountered a problem while processing your request. This
            could be due to:
          </p>

          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Temporary service interruption</li>
            <li>Issues with external APIs (YouTube or OpenAI)</li>
            <li>Database connection problems</li>
            <li>Invalid search parameters</li>
          </ul>

          <div className="pt-4">
            <p className="text-gray-600 mb-4">
              Please try again later or contact support if the problem persists.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              >
                Return to Home
              </Link>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-center"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
