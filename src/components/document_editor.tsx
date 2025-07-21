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
  EuiSpacer,
} from "@elastic/eui";

interface DocumentEditorProps {
  initialTitle?: string;
  data?: OutputData | string;
  isEditing: boolean;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  saveError?: string | null;
  documentData?: any; // Full document object with metadata
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
  documentData,
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
  const currentTitleRef = useRef(initialTitle || "Гарчиггүй");
  const [title, setTitle] = useState(initialTitle || "Гарчиггүй");

  // Helper function to format date
  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return "";
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";
    
    return dateObj.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extract metadata from documentData
  const createdDate = documentData?.created_at || documentData?.createdAt;
  const updatedDate = documentData?.updated_at || documentData?.updatedAt;
  const createdBy = documentData?.created_by?.email || documentData?.created_by?.name || documentData?.createdBy;
  const updatedBy = documentData?.updated_by?.email || documentData?.updated_by?.name || documentData?.updatedBy;

  // Handle title change
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    currentTitleRef.current = newTitle;
    if (isEditing && editorInstanceRef.current && isReadyRef.current) {
      // Trigger onChange with current editor data
      editorInstanceRef.current.save().then((outputData) => {
        console.log("Editor data saved from Title change:", newTitle, outputData);
        onChange(newTitle, outputData);
      });
    }
  }, [isEditing, onChange]);

  // Initialize editor when in edit mode
  useEffect(() => {
    if (isEditing && typeof window !== "undefined" && !editorInstanceRef.current) {
      if (viewerContainerRef.current) {
        viewerContainerRef.current.innerHTML = '';
      }
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
          // Use the current title from ref to avoid stale closure
          onChange(currentTitleRef.current, savedData);
        },
        onReady: () => {
          console.log("Editor.js бэлэн боллоо!");
          isReadyRef.current = true;
          editorInstanceRef.current = editor;
          internalChangeRef.current = false;
        },
      });
    }

    // Cleanup editor when switching to view mode
    if (!isEditing && editorInstanceRef.current) {
      try {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
        isReadyRef.current = false;
        console.log("Editor.js устгагдлаа");
      } catch (error) {
        console.error("Editor.js-ийг устгахад алдаа гарлаа:", error);
      }
    }
  }, [isEditing, data, title, onChange, holder]);

  // Update title when initialTitle changes
  useEffect(() => {
    if (!isEditing) {
      const newTitle = initialTitle || "Гарчиггүй";
      setTitle(newTitle);
      currentTitleRef.current = newTitle;
    }
  }, [initialTitle, isEditing]);

  // Update read-only view when data changes and not editing
  useEffect(() => {
    console.log('renderReadOnlyView useEffect - засаж байна уу:', isEditing, 'өгөгдөл:', !!data);
    
    const renderReadOnlyView = () => {
      console.log('renderReadOnlyView дуудагдлаа, viewerContainerRef.current:', viewerContainerRef.current);
      console.log('өгөгдөл:', data);
      
      if (!viewerContainerRef.current || !data) {
        console.log('Эрт буцах: containerRef хоосон эсвэл өгөгдөл байхгүй');
        return;
      }
      if (viewerContainerRef.current) {
        viewerContainerRef.current.innerHTML = '';
      }

      let parsedData: OutputData;
      
      // Parse data if it's a string
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          console.error('Баримт бичгийн өгөгдлийг задлахад алдаа гарлаа:', error);
          viewerContainerRef.current.innerHTML = '<p>Баримт бичгийн агуулгыг ачаалахад алдаа гарлаа.</p>';
          return;
        }
      } else {
        parsedData = data;
      }

      // Render blocks manually for read-only view
      if (parsedData?.blocks) {
        parsedData.blocks.forEach((block) => {
          const blockElement = document.createElement('div');
          blockElement.style.margin = '6px 0';

          switch (block.type) {
            case 'paragraph':
              const p = document.createElement('p');
              p.innerHTML = block.data.text || '';
              p.style.fontSize = '14px';
              p.style.lineHeight = '22.4px';
              p.style.padding = '.4em 0';
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
              const renderList = (items: any[], style: string, meta?: any, level = 0, parentNumbers: number[] = []) => {
                let listElement: HTMLElement;
                
                switch (style) {
                  case 'ordered':
                    listElement = document.createElement('ol');
                    // For nested ordered lists, we'll use manual numbering
                    if (level > 0) {
                      listElement.style.listStyleType = 'none';
                    } else {
                      // Handle start number for top-level ordered lists
                      if (meta?.start && meta.start !== 1) {
                        (listElement as HTMLOListElement).start = meta.start;
                      }
                      // Handle counter type styling for top-level only
                      if (meta?.counterType) {
                        switch (meta.counterType) {
                          case 'lower-roman':
                            listElement.style.listStyleType = 'lower-roman';
                            break;
                          case 'upper-roman':
                            listElement.style.listStyleType = 'upper-roman';
                            break;
                          case 'lower-alpha':
                            listElement.style.listStyleType = 'lower-alpha';
                            break;
                          case 'upper-alpha':
                            listElement.style.listStyleType = 'upper-alpha';
                            break;
                          case 'numeric':
                          default:
                            listElement.style.listStyleType = 'decimal';
                            break;
                        }
                      }
                    }
                    break;
                  case 'checklist':
                    listElement = document.createElement('ul');
                    listElement.style.listStyleType = 'none';
                    break;
                  case 'unordered':
                  default:
                    listElement = document.createElement('ul');
                    break;
                }
                
                // Set common list styles
                listElement.style.paddingLeft = level === 0 ? '20px' : '24px';
                listElement.style.margin = level === 0 ? '0 0 16px 0' : '4px 0';
                
                items.forEach((item: any, index: number) => {
                  const li = document.createElement('li');
                  li.style.marginBottom = '4px';
                  
                  // Calculate current number for nested ordered lists
                  const currentNumbers = [...parentNumbers];
                  if (style === 'ordered') {
                    const startNumber = (level === 0 && meta?.start) ? meta.start : 1;
                    currentNumbers.push(startNumber + index);
                  }
                  
                  if (style === 'checklist') {
                    // Create checkbox for checklist items
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = item.meta?.checked || false;
                    checkbox.disabled = true; // Read-only mode
                    checkbox.style.marginRight = '8px';
                    checkbox.style.verticalAlign = 'middle';
                    li.appendChild(checkbox);
                    
                    const span = document.createElement('span');
                    span.innerHTML = item.content || '';
                    span.style.verticalAlign = 'middle';
                    if (item.meta?.checked) {
                      span.style.textDecoration = 'line-through';
                      span.style.color = '#666';
                    }
                    li.appendChild(span);
                  } else if (style === 'ordered' && level > 0) {
                    // Manual numbering for nested ordered lists
                    const numberSpan = document.createElement('span');
                    numberSpan.textContent = currentNumbers.join('.') + '. ';
                    numberSpan.style.fontWeight = '500';
                    numberSpan.style.marginRight = '4px';
                    numberSpan.style.color = '#666';
                    li.appendChild(numberSpan);
                    
                    const contentSpan = document.createElement('span');
                    contentSpan.innerHTML = item.content || '';
                    li.appendChild(contentSpan);
                  } else {
                    li.innerHTML = item.content || '';
                  }
                  
                  // Handle nested items recursively
                  if (item.items && item.items.length > 0) {
                    const nestedList = renderList(item.items, style, meta, level + 1, currentNumbers);
                    li.appendChild(nestedList);
                  }
                  
                  listElement.appendChild(li);
                });
                
                return listElement;
              };
              
              if (block.data.items && block.data.items.length > 0) {
                const list = renderList(block.data.items, block.data.style || 'unordered', block.data.meta);
                blockElement.appendChild(list);
              }
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
              pre.style.fontSize = '14PX';
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
                  caption.style.fontSize = '14PX';
                  caption.style.color = '#666';
                  caption.style.textAlign = 'center';
                  caption.style.margin = '0 0 16px 0';
                  blockElement.appendChild(caption);
                }
              }
              break;

            default:
              // Танихгүй блок төрлүүдийг текст болгож харуулах
              const defaultDiv = document.createElement('div');
              defaultDiv.innerHTML = block.data.text || JSON.stringify(block.data);
              defaultDiv.style.padding = '8px';
              defaultDiv.style.backgroundColor = '#f0f0f0';
              defaultDiv.style.borderRadius = '4px';
              defaultDiv.style.fontSize = '14px';
              defaultDiv.style.margin = '0 0 16px 0';
              blockElement.appendChild(defaultDiv);
              break;
          }

          viewerContainerRef.current?.appendChild(blockElement);
        });
      }
    };
    
    if (!isEditing) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        renderReadOnlyView();
      }, 0);
    }
  }, [isEditing, data]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Document Header with Title and Buttons */}
      <EuiFlexGroup 
        justifyContent="spaceBetween" 
        alignItems="flexStart" 
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
          <EuiFlexGroup direction="column" gutterSize="xs">
            <EuiFlexItem>
              <EuiFlexGroup alignItems="center" gutterSize="s">
                <EuiFlexItem grow={false}>
                  {isEditing ? (
                    <EuiFieldText
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Баримт бичгийн гарчиг..."
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
            
            {/* Created Date and Updated Date */}
            {(createdDate || updatedDate || createdBy || updatedBy) && (
              <EuiFlexItem>
                <EuiFlexGroup direction="column" gutterSize="xs">
                  {/* First row: Created info */}
                  {(createdDate || createdBy) && (
                    <EuiFlexItem>
                      <EuiFlexGroup alignItems="center" gutterSize="m">
                        <EuiFlexItem grow={false}>
                          <EuiText size="s" color="subdued" style={{ fontSize: "13px" }}>
                            <span style={{ fontWeight: "500" }}>Үүсгэсэн:</span>{" "}
                            {createdBy && <span>{createdBy}</span>}
                            {createdBy && createdDate && <span>, </span>}
                            {createdDate && <span>{formatDate(createdDate)}</span>}
                          </EuiText>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                  )}
                  
                  {/* Second row: Updated info */}
                  {(updatedDate || updatedBy) && (updatedDate !== createdDate || updatedBy !== createdBy) && (
                    <EuiFlexItem>
                      <EuiFlexGroup alignItems="center" gutterSize="m">
                        <EuiFlexItem grow={false}>
                          <EuiText size="s" color="subdued" style={{ fontSize: "13px" }}>
                            <span style={{ fontWeight: "500" }}>Засварласан:</span>{" "}
                            {updatedBy && <span>{updatedBy}</span>}
                            {updatedBy && updatedDate && <span>, </span>}
                            {updatedDate && <span>{formatDate(updatedDate)}</span>}
                          </EuiText>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                  )}
                </EuiFlexGroup>
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
        <div 
          style={{
            border: "1px solid #d3dff8",
            borderRadius: "4px",
            padding: "10px",
            minHeight: "200px",
          }}
        >
          <div style={{
            maxWidth: "650px",
            margin: "0 auto",
          }} ref={viewerContainerRef}>          {!data && (
            <EuiText color="subdued">
              <p>Энэ баримт бичиг хоосон байна.</p>
            </EuiText>
          )}
          </div>
          {isEditing && <div id={holder}></div>}
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
