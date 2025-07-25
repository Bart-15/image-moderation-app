import { Authenticator } from "@aws-amplify/ui-react";
import { Header } from "./components/header";
import { Dashboard } from "./features/dashboard";
import UploadSection from "./components/upload-section";

function App() {
  return (
    <Authenticator>
      {({ user }) => (
        <>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header user={user} />

            <main className="max-w-7xl mx-auto px-4 py-6">
              {/* Dashboard Section */}
              <Dashboard />

              {/* Upload Section */}
              <UploadSection />
            </main>
          </div>
        </>
      )}
    </Authenticator>
  );
}

export default App;
