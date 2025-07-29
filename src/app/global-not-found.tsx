import Link from 'next/link';
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export const metadata = {
  title: 'Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function GlobalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <FaExclamationTriangle className="text-yellow-500 text-6xl mb-6" />
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4">404 - Not Found</h1>
      <p className="text-lg text-gray-600 mb-6">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </div>
  )
}