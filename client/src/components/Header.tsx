import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import type { AuthUser } from "aws-amplify/auth";
import { removeHeaderToken, setHeaderToken } from "../utils/axios";

type HeaderProps = {
  user: AuthUser | undefined;
};

export const Header = ({ user }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function init() {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString() as unknown as string;
      setHeaderToken(token);
    }

    init();
  }, []);

  async function handleSignout() {
    removeHeaderToken();
    await signOut();
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Image Moderator
          </h1>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
          >
            <span className="sr-only">Open main menu</span>
            {/* Hamburger icon */}
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <span className="text-gray-600">
              Hello, {user?.signInDetails?.loginId} 🚀
            </span>
            <button
              onClick={handleSignout}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-900 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:hidden mt-4 space-y-4`}
        >
          <div className="px-2 pt-2 pb-3 space-y-3">
            <span className="block text-gray-600">
              Hello, {user?.signInDetails?.loginId} 🚀
            </span>
            <button
              onClick={handleSignout}
              className="w-full text-left inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
