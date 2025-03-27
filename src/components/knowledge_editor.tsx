// app/editor/page.tsx (or app/page.tsx)
"use client"; // This page needs to be a Client Component to manage state

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic"; // Import dynamic
import { OutputData } from "@editorjs/editorjs"; // Import OutputData type


export default function EditorPage() {
  // State to hold the editor's data
  const [editorData, setEditorData] = useState<OutputData | undefined>(undefined); // Start with undefined or initial data

  // Memoize the onChange handler to prevent unnecessary re-renders of the Editor component
  const handleEditorChange = useCallback((data: OutputData) => {
    console.log("Editor data changed: ", data);
    setEditorData(data);
    // Here you could implement auto-saving logic, e.g., debounce saving to an API
  }, []);

  const handleSave = () => {
    if (editorData) {
      console.log("Saving data:", editorData);
      // --- Send 'editorData' to your backend API here ---
      // Example:
      // fetch('/api/posts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editorData),
      // })
      // .then(response => response.json())
      // .then(savedPost => console.log('Post saved:', savedPost))
      // .catch(error => console.error('Error saving post:', error));
      alert("Data saved! Check the console."); // Placeholder
    } else {
      console.log("No data to save.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Post Editor</h1>

      <div className="editor-wrapper border rounded-md p-4 bg-white shadow">
        {/* Render the Editor component */}
        <Editor
          data={editorData} // Pass current data (can be initial data)
          onChange={handleEditorChange} // Pass the handler function
          holder={EDITOR_HOLDER_ID} // Pass the unique ID
        />
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Post
        </button>
      </div>

      <div className="mt-6 p-4 border rounded bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Saved Editor Data (JSON)</h2>
        <pre className="text-sm overflow-x-auto">
          {editorData ? JSON.stringify(editorData, null, 2) : "No data yet..."}
        </pre>
      </div>
    </div>
  );
}