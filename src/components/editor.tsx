// components/Editor.tsx
"use client";

import React, { useEffect, useRef, memo } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "@/lib/editorjs-tools";
import { editorjsI18nMn } from "@/lib/editorjs-i18n-mn"; // <--- Import the translations
import { EuiText } from "@elastic/eui";

interface EditorProps {
  initialTitle?: string;
  data?: OutputData;
  onChange: (title: string, data: OutputData) => void;
  holder: string;
}

const Editor: React.FC<EditorProps> = ({ initialTitle, data, onChange, holder }) => {
  const editorInstanceRef = useRef<EditorJS | null>(null);
  const isReadyRef = useRef(false);
  const internalChangeRef = useRef(false);
  const [title, setTitle] = React.useState(initialTitle || "Гарчиггүй "); // Add state for the title

  useEffect(() => {
    if (typeof window !== "undefined" && !editorInstanceRef.current) {
      const editor = new EditorJS({
        holder: holder,
        tools: EDITOR_TOOLS,
        data: data,
        placeholder: "Нийтлэлээ бичиж эхэлнэ үү...", // <--- Optional: Translate placeholder too

        // --- Add the i18n configuration ---
        i18n: {
          /**
           * @see https://editorjs.io/internationalization/
           * Pass the 'messages' object containing translations
           */
          messages: editorjsI18nMn,
        },
        // -----------------------------------

        async onChange(api, event) {
          if (!isReadyRef.current) return;

          const savedData = await api.saver.save();
          internalChangeRef.current = true;
          onChange(title, savedData);
        },

        onReady: () => {
          console.log("Editor.js is ready to work!");
          isReadyRef.current = true;
          editorInstanceRef.current = editor;
          internalChangeRef.current = false;
        },
      });
    }

    return () => {
      if (editorInstanceRef.current?.destroy) {
        try {
          editorInstanceRef.current.destroy();
          editorInstanceRef.current = null;
          console.log("Editor.js instance destroyed");
        } catch (error) {
          console.error("Error destroying Editor.js instance:", error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, holder, onChange]); // Keep dependencies minimal

  // Effect for handling EXTERNAL data updates (when the `data` prop changes)
  useEffect(() => {
    setTitle(initialTitle || "Гарчиггүй ");

    if (internalChangeRef.current) {
      internalChangeRef.current = false;
      return ;
    }

    // Ensure the editor instance exists, is ready, and the data prop is actually defined
    if (editorInstanceRef.current && isReadyRef.current && data) {
      // Check if the editor is ready using its promise-based API
      editorInstanceRef.current.isReady
        .then(() => {
          // Optional: Deep compare data with current editor state if needed
          // to prevent rendering identical data, but often render is idempotent enough.
          // const currentData = await editorInstanceRef.current.save();
          // if (JSON.stringify(currentData) !== JSON.stringify(data)) { ... }

          console.log(`External data changed for [${holder}], rendering new data.`);
          // Render the new data. This clears existing content and adds the new blocks.
          editorInstanceRef.current?.render(data).catch((error) => {
            editorInstanceRef.current?.render({
              blocks: [
                {
                  type: "paragraph",
                  data: {
                    text: `Error during editor.isReady check or render for [${holder}]: ${error}`,
                  },
                },
              ],
            });
          });
        })
        .catch((error) => {
          editorInstanceRef.current?.render({
            blocks: [
              {
                type: "paragraph",
                data: {
                  text: `Error during editor.isReady check or render for [${holder}]: ${error}`,
                },
              },
            ],
          });
          // console.error(`Error during editor.isReady check or render for [${holder}]:`, error);
          return null;
        });
    }
    // This effect specifically reacts to changes in the `data` prop
  }, [initialTitle, holder, data]); // Dependency array includes 'data'

  return (
    <div style={{
      border: "1px solid #d3dff8",
      borderRadius: "4px",
      padding: "10px",
      minHeight: "200px",
    }}>
      <div id={holder}></div>
    </div>
  );
};

export default memo(Editor);
