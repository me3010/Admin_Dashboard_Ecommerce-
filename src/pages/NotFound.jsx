import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-600 mb-6">Page not found</p>
      <Link
        to="/dashboard"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
