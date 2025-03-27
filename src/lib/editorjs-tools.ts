// lib/editorjs-tools.ts
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
// import ImageTool from '@editorjs/image'; // Requires backend setup for uploads

// Define Tool classes - Adjust imports as needed if using different versions or packages
// Ensure these imports match the packages you installed

export const EDITOR_TOOLS = {
  // NOTE: Paragraph is default tool, import only if needed for specific config
  paragraph: {
    class: Paragraph,
    inlineToolbar: true, // Enable inline formatting (bold, italic, links)
  },
  list: {
    class: List,
    inlineToolbar: true,
    config: {
      defaultStyle: "unordered", // 'ordered' or 'unordered'
    },
  },
  header: {
    class: Header,
    inlineToolbar: true,
    config: {
      placeholder: "Enter a header",
      levels: [2, 3, 4], // Which heading levels to support (h2, h3, h4)
      defaultLevel: 2,
    },
  },
  embed: {
    class: Embed,
    inlineToolbar: true, // Hides toolbar for embeds but keeps config button
    config: {
      services: {
        youtube: true,
        coub: true,
        // Add other services as needed
      },
    },
  },
  // image: {
  //   class: ImageTool,
  //   config: {
  //     uploader: {
  //       // --- IMAGE UPLOAD CONFIGURATION ---
  //       // You'll need an backend endpoint to handle image uploads
  //       // Example using a hypothetical '/api/upload' endpoint:
  //       uploadByFile: async (file: File) => {
  //         const formData = new FormData();
  //         formData.append('image', file);
  //
  //         try {
  //           const response = await fetch('/api/upload', { // YOUR UPLOAD API ENDPOINT
  //             method: 'POST',
  //             body: formData,
  //           });
  //
  //           if (!response.ok) {
  //             throw new Error(`Upload failed: ${response.statusText}`);
  //           }
  //
  //           const result = await response.json();
  //           // Assuming your API returns { success: 1, file: { url: '...' } }
  //           if (result.success && result.file?.url) {
  //             return {
  //               success: 1,
  //               file: {
  //                 url: result.file.url,
  //                 // You can add other file properties if needed
  //               },
  //             };
  //           } else {
  //             throw new Error(result.message || 'Upload failed, invalid response format.');
  //           }
  //         } catch (error) {
  //           console.error('Image upload error:', error);
  //           return {
  //             success: 0,
  //             // Optionally provide an error message to the user in the editor
  //             // file: { message: 'Upload failed. Please try again.' }
  //           };
  //         }
  //       },
  //       // uploadByUrl: async (url: string) => {
  //       //   // Optional: If you want to support pasting image URLs
  //       //   // You might need a backend endpoint to proxy/validate the URL
  //       // }
  //     },
  //     // Optional: Add endpoints for pasting via URL or drag-and-drop
  //   },
  // },
};