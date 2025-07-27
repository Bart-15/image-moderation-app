import CardLoader from "./components/card-loader";
import { useGetStats } from "./hooks/useGetStats";

export const Dashboard = () => {
  const { data, isLoading } = useGetStats();

  if (isLoading) {
    return <CardLoader />;
  }

  const userStats = data?.data?.userStats;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Uploads Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-600 text-sm font-medium">Total Uploads</h3>
            <div className="bg-blue-50 rounded-full p-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">
            {userStats?.totalUploads}
          </p>
          <p className="mt-1 text-sm text-gray-500">Total images processed</p>
        </div>

        {/* Inappropriate Uploads Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-600 text-sm font-medium">
              Flagged Content
            </h3>
            <div className="bg-red-50 rounded-full p-2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">
            {userStats?.inappropriateUploads}
          </p>
          <p className="mt-1 text-sm text-gray-500">Flagged inappropriate</p>
        </div>
      </div>
    </div>
  );
};
