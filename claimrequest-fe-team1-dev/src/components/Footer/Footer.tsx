import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  // Memoize the current year
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="bg-gray-100 text-gray-600 dark:bg-[#121212] dark:text-gray-50 dark:border-t dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Claims</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/create-claim" className="hover:text-blue-600">
                  Create Claim
                </Link>
              </li>
              <li>
                <Link to="/claims" className="hover:text-blue-600">
                  View Claims
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p>© {currentYear} FPT Claim Request System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
