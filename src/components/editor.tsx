// components/Editor.tsx
"use client";

import React, { useEffect, useRef, memo } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "@/lib/editorjs-tools";
import { editorjsI18nMn } from "@/lib/editorjs-i18n-mn"; // <--- Import the translations

interface EditorProps {
  data?: OutputData;
  onChange: (data: OutputData) => void;
  holder: string;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, holder }) => {
  const editorInstanceRef = useRef<EditorJS | null>(null);

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
          const savedData = await api.saver.save();
          onChange(savedData);
        },

        onReady: () => {
          console.log("Editor.js is ready to work!");
        },
      });
      editorInstanceRef.current = editor;
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
  }, [holder]); // Keep dependencies minimal

  return <div id={holder} />;
};

export default memo(Editor);