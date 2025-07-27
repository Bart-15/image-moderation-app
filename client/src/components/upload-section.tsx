import { useFileUpload } from "../hooks/useFileUpload";

const UploadSection = () => {
  const {
    selectedFile,
    dragActive,
    uploadMutation,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  } = useFileUpload();

  return (
    <div className="mt-8">
      <h2 className="text-xl font-medium text-gray-900 mb-6">Upload Image</h2>
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <div className="max-w-xl mx-auto">
          <div
            className={`flex justify-center px-6 pt-5 pb-6 border-2 ${
              dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
            } border-dashed rounded-lg hover:border-gray-400 transition-colors`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>

              {uploadMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  Error uploading file. Please try again.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
