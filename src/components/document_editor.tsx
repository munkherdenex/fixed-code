// components/DocumentEditor.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "@/lib/editorjs-tools";
import { editorjsI18nMn } from "@/lib/editorjs-i18n-mn";
import {
  EuiText,
  EuiTitle,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiCallOut,
} from "@elastic/eui";

interface DocumentEditorProps {
  initialTitle?: string;
  data?: OutputData | string;
  isEditing: boolean;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  saveError?: string | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (title: string, data: OutputData) => void;
  holder: string;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  initialTitle,
  data,
  isEditing,
  isSaving = false,
  hasUnsavedChanges = false,
  saveError = null,
  onEdit,
  onSave,
  onCancel,
  onChange,
  holder,
}) => {
  const editorInstanceRef = useRef<EditorJS | null>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const isReadyRef = useRef(false);
  const internalChangeRef = useRef(false);
  const [title, setTitle] = useState(initialTitle || "Untitled Document");

  // Handle title change
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    if (isEditing && editorInstanceRef.current && isReadyRef.current) {
      // Trigger onChange with current editor data
      editorInstanceRef.current.save().then((outputData) => {
        onChange(newTitle, outputData);
      });
    }
  }, [isEditing, onChange]);

  // Initialize editor when in edit mode
  useEffect(() => {
    if (isEditing && typeof window !== "undefined" && !editorInstanceRef.current) {
      const editor = new EditorJS({
        holder: holder,
        tools: EDITOR_TOOLS,
        data: typeof data === 'string' ? JSON.parse(data || '{}') : data,
        placeholder: "Нийтлэлээ бичиж эхэлнэ үү...",
        i18n: {
          messages: editorjsI18nMn,
        },
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

    // Cleanup editor when switching to view mode
    return () => {
      if (!isEditing && editorInstanceRef.current?.destroy) {
        try {
          editorInstanceRef.current.destroy();
          editorInstanceRef.current = null;
          isReadyRef.current = false;
          console.log("Editor.js instance destroyed");
        } catch (error) {
          console.error("Error destroying Editor.js instance:", error);
        }
      }
    };
  }, [isEditing, data, title, onChange, holder]);

  // Update title when initialTitle changes
  useEffect(() => {
    setTitle(initialTitle || "Untitled Document");
  }, [initialTitle]);

  // Render read-only view
  const renderReadOnlyView = useCallback(() => {
    if (!viewerContainerRef.current || !data) return;

    // Clear previous content
    viewerContainerRef.current.innerHTML = '';

    let parsedData: OutputData;
    
    // Parse data if it's a string
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Error parsing document data:', error);
        viewerContainerRef.current.innerHTML = '<p>Error loading document content.</p>';
        return;
      }
    } else {
      parsedData = data;
    }

    // Render blocks manually for read-only view
    if (parsedData?.blocks) {
      parsedData.blocks.forEach((block) => {
        const blockElement = document.createElement('div');
        blockElement.style.marginBottom = '16px';

        switch (block.type) {
          case 'paragraph':
            const p = document.createElement('p');
            p.innerHTML = block.data.text || '';
            p.style.fontSize = '16px';
            p.style.lineHeight = '1.6';
            p.style.margin = '0 0 16px 0';
            blockElement.appendChild(p);
            break;

          case 'header':
            const headerLevel = block.data.level || 2;
            const header = document.createElement(`h${headerLevel}`);
            header.innerHTML = block.data.text || '';
            header.style.fontWeight = 'bold';
            header.style.marginTop = headerLevel === 1 ? '24px' : '20px';
            header.style.marginBottom = '12px';
            header.style.color = '#343741';
            blockElement.appendChild(header);
            break;

          case 'list':
            const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            const list = document.createElement(listTag);
            block.data.items?.forEach((item: string) => {
              const li = document.createElement('li');
              li.innerHTML = item;
              li.style.marginBottom = '4px';
              list.appendChild(li);
            });
            list.style.paddingLeft = '20px';
            list.style.margin = '0 0 16px 0';
            blockElement.appendChild(list);
            break;

          case 'quote':
            const quote = document.createElement('blockquote');
            quote.innerHTML = block.data.text || '';
            quote.style.borderLeft = '4px solid #0077CC';
            quote.style.paddingLeft = '16px';
            quote.style.margin = '16px 0';
            quote.style.fontStyle = 'italic';
            quote.style.backgroundColor = '#f9fbff';
            quote.style.padding = '12px 16px';
            quote.style.borderRadius = '4px';
            blockElement.appendChild(quote);
            break;

          case 'code':
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = block.data.code || '';
            pre.appendChild(code);
            pre.style.backgroundColor = '#f4f4f4';
            pre.style.padding = '12px';
            pre.style.borderRadius = '4px';
            pre.style.overflow = 'auto';
            pre.style.fontSize = '14px';
            pre.style.margin = '0 0 16px 0';
            blockElement.appendChild(pre);
            break;

          case 'delimiter':
            const hr = document.createElement('hr');
            hr.style.border = 'none';
            hr.style.borderTop = '2px solid #ddd';
            hr.style.margin = '24px 0';
            blockElement.appendChild(hr);
            break;

          case 'image':
            if (block.data.file?.url) {
              const img = document.createElement('img');
              img.src = block.data.file.url;
              img.alt = block.data.caption || '';
              img.style.maxWidth = '100%';
              img.style.height = 'auto';
              img.style.borderRadius = '4px';
              img.style.margin = '0 0 8px 0';
              blockElement.appendChild(img);
              
              if (block.data.caption) {
                const caption = document.createElement('p');
                caption.innerHTML = block.data.caption;
                caption.style.fontSize = '14px';
                caption.style.color = '#666';
                caption.style.textAlign = 'center';
                caption.style.margin = '0 0 16px 0';
                blockElement.appendChild(caption);
              }
            }
            break;

          default:
            // For any unhandled block types, try to display as text
            const defaultDiv = document.createElement('div');
            defaultDiv.innerHTML = block.data.text || JSON.stringify(block.data);
            defaultDiv.style.padding = '8px';
            defaultDiv.style.backgroundColor = '#f0f0f0';
            defaultDiv.style.borderRadius = '4px';
            defaultDiv.style.fontSize = '14px';
            defaultDiv.style.margin = '0 0 16px 0';
            blockElement.appendChild(defaultDiv);
        }

        viewerContainerRef.current?.appendChild(blockElement);
      });
    }
  }, [data]);

  // Update read-only view when data changes and not editing
  useEffect(() => {
    if (!isEditing) {
      renderReadOnlyView();
    }
  }, [isEditing, data, renderReadOnlyView]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Document Header with Title and Buttons */}
      <EuiFlexGroup 
        justifyContent="spaceBetween" 
        alignItems="center" 
        style={{ 
          padding: "8px 16px", 
          flexShrink: 0,
          flexGrow: 0,
          minHeight: "48px",
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          borderBottom: "1px solid #e1e5ea",
          borderRadius: "4px 4px 0 0",
        }}
      >
        <EuiFlexItem>
          <EuiFlexGroup alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false}>
              {isEditing ? (
                <EuiFieldText
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Document title..."
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    border: "1px solid #d3dce0",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    minWidth: "200px",
                  }}
                />
              ) : (
                <EuiTitle size="s">
                  <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
                    {title}
                  </h3>
                </EuiTitle>
              )}
            </EuiFlexItem>
            {hasUnsavedChanges && (
              <EuiFlexItem grow={false}>
                <EuiText size="xs" color="warning" style={{ fontSize: "12px" }}>
                  • Хадгалагдаагүй өөрчлөлт
                </EuiText>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup gutterSize="xs" alignItems="center">
            {!isEditing ? (
              <EuiFlexItem grow={false}>
                <EuiButton
                  iconType="pencil"
                  onClick={onEdit}
                  color="primary"
                  size="s"
                >
                  Засах
                </EuiButton>
              </EuiFlexItem>
            ) : (
              <>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    iconType="save"
                    fill
                    onClick={onSave}
                    isLoading={isSaving}
                    disabled={!hasUnsavedChanges}
                    color="success"
                    size="s"
                  >
                    Хадгалах
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    iconType="cross"
                    color="danger"
                    onClick={onCancel}
                    size="s"
                  >
                    Цуцлах
                  </EuiButton>
                </EuiFlexItem>
              </>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>

      {/* Save Error Message */}
      {saveError && (
        <div style={{ padding: "8px 16px", flexShrink: 0 }}>
          <EuiCallOut title="Алдаа гарлаа" color="danger" iconType="alert" size="s">
            <p style={{ margin: 0, fontSize: "14px" }}>{saveError}</p>
          </EuiCallOut>
        </div>
      )}

      {/* Document Content */}
      <div 
        style={{ 
          padding: "16px", 
          flex: 1, 
          overflow: "auto",
          transition: "opacity 0.2s ease"
        }}
      >
        {isEditing ? (
          <div 
            style={{
              border: "1px solid #d3dff8",
              borderRadius: "4px",
              padding: "10px",
              minHeight: "200px",
            }}
          >
            <div id={holder}></div>
          </div>
        ) : (
          <div 
            style={{
              border: "1px solid #d3dff8",
              borderRadius: "4px",
              padding: "20px",
              minHeight: "400px",
              backgroundColor: "#fafbfd"
            }}
          >
            <div ref={viewerContainerRef}>
              {!data && (
                <EuiText color="subdued">
                  <p>Энэ баримт бичиг хоосон байна.</p>
                </EuiText>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentEditor;
