// components/DocumentViewer.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { OutputData } from "@editorjs/editorjs";
import { EuiText, EuiSpacer } from "@elastic/eui";

interface DocumentViewerProps {
  title?: string;
  data?: OutputData | string;
  holder: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ title, data, holder }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    let parsedData: OutputData;
    
    // Parse data if it's a string
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Error parsing document data:', error);
        containerRef.current.innerHTML = '<p>Error loading document content.</p>';
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
            blockElement.appendChild(p);
            break;

          case 'header':
            const headerLevel = block.data.level || 2;
            const header = document.createElement(`h${headerLevel}`);
            header.innerHTML = block.data.text || '';
            header.style.fontWeight = 'bold';
            header.style.marginTop = headerLevel === 1 ? '24px' : '20px';
            header.style.marginBottom = '12px';
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
            blockElement.appendChild(list);
            break;

          case 'quote':
            const quote = document.createElement('blockquote');
            quote.innerHTML = block.data.text || '';
            quote.style.borderLeft = '4px solid #ddd';
            quote.style.paddingLeft = '16px';
            quote.style.margin = '16px 0';
            quote.style.fontStyle = 'italic';
            quote.style.backgroundColor = '#f9f9f9';
            quote.style.padding = '12px 16px';
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
              blockElement.appendChild(img);
              
              if (block.data.caption) {
                const caption = document.createElement('p');
                caption.innerHTML = block.data.caption;
                caption.style.fontSize = '14px';
                caption.style.color = '#666';
                caption.style.textAlign = 'center';
                caption.style.marginTop = '8px';
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
            blockElement.appendChild(defaultDiv);
        }

        containerRef.current?.appendChild(blockElement);
      });
    }
  }, [data]);

  return (
    <div style={{
      border: "1px solid #d3dff8",
      borderRadius: "4px",
      padding: "20px",
      minHeight: "400px",
      backgroundColor: "#fafbfd"
    }}>
      {title && (
        <>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '24px',
            color: '#343741'
          }}>
            {title}
          </h1>
        </>
      )}
      <div ref={containerRef} id={holder}>
        {!data && (
          <EuiText color="subdued">
            <p>Энэ баримт бичиг хоосон байна.</p>
          </EuiText>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
