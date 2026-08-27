import React from "react";
import ContentProcessor from "./ContentProcessor";
import URLProcessor from "./URLProcessor";

function App() {
  return (
    <div className="App">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          Link formatter for social media
        </h1>
        <URLProcessor />
        <ContentProcessor />
      </div>
    </div>
  );
}

export default App;
