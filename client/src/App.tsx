import "@aws-amplify/ui-react/styles.css";
import "./lib/amplify";

import { Authenticator } from "@aws-amplify/ui-react";

function App() {
  return (
    <Authenticator>
      <p className="text-center py-2">Hello test Bart tabusao</p>
    </Authenticator>
  );
}

export default App;
