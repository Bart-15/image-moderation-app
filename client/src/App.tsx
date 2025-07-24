import "@aws-amplify/ui-react/styles.css";
import "./lib/amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import UploadSection from "./components/UploadSection";

function App() {
  // Static data for demonstration
  const stats = {
    totalUploads: 156,
    inappropriateUploads: 12,
  };

  return (
    <Authenticator>
      {({ user }) => (
        <>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header user={user} />

            <main className="max-w-7xl mx-auto px-4 py-6">
              {/* Dashboard Section */}
              <Dashboard stats={stats} />

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
