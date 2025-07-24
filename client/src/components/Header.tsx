import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { useEffect } from "react";
import type { AuthUser } from "aws-amplify/auth";
import { removeHeaderToken, setHeaderToken } from "../utils/axios";

type HeaderProps = {
  user: AuthUser | undefined;
};

export const Header = ({ user }: HeaderProps) => {
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
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Image Moderator
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            Hello, {user?.signInDetails?.loginId} 🚀
          </span>
          <button
            onClick={handleSignout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
