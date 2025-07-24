const CardLoader = () => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skeleton Cards */}
        {[1, 2].map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="bg-gray-200 rounded-full p-2 w-9 h-9"></div>
            </div>
            <div className="mt-4 h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="mt-1 h-4 bg-gray-200 rounded w-2/5"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardLoader;
