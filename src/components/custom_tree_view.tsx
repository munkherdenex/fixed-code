// @ts-nocheck
import React, { useState, useCallback, useEffect } from "react";
import {
  EuiIcon,
  EuiButtonIcon,
  EuiPopover,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiBadge,
  EuiPagination,
  EuiSpacer,
} from "@elastic/eui";
import knowledgeApi from "@/api/knowledge";

// Simple recursive function to find a node by ID
const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

interface TreeNode {
  id: string;
  title: string;
  status?: string;
  children?: TreeNode[];
  body?: any;
}

interface CustomTreeViewProps {
  selectedItemId: string | null;
  onSelectItem: (node: TreeNode | null) => void;
  refreshTrigger: number;
  onCreateNew: () => void;
  onRefresh?: () => void;
}

interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  selectedItemId: string | null;
  expandedIds: Set<string>;
  onSelect: (node: TreeNode | null) => void;
  onToggleExpand: (nodeId: string) => void;
  onRename: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddSubpage: (nodeId: string) => void;
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  level,
  selectedItemId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onRename,
  onDelete,
  onAddSubpage,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedItemId === node.id;
  const isExpanded = expandedIds.has(node.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(node);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(node.id);
    }
  };

  const openPopover = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPopoverOpen(true);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleAction = (action: () => void) => {
    closePopover();
    action();
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          minHeight: "36px",
          display: "flex",
          alignItems: "center",
          paddingLeft: `${level * 20 + 12}px`,
          paddingRight: "12px",
          paddingTop: "4px",
          paddingBottom: "4px",
          cursor: "pointer",
          backgroundColor: isSelected ? "#f5f7fa" : (isHovered ? "#f9fbff" : "transparent"),
          border: isSelected ? "1px solid #d3dce0" : "1px solid transparent",
          borderRadius: "6px",
          margin: "1px 0",
          transition: "all 0.15s ease",
          userSelect: "none",
          position: "relative",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Expand/Collapse Button */}
        <div
          style={{
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "6px",
            cursor: hasChildren ? "pointer" : "default",
            borderRadius: "4px",
            backgroundColor: hasChildren && isHovered ? "#e3f2fd" : "transparent",
            transition: "background-color 0.15s ease",
          }}
          onClick={handleExpandClick}
        >
          {hasChildren ? (
            <EuiIcon
              type={isExpanded ? "arrowDown" : "arrowRight"}
              size="s"
              style={{ color: "#69707D" }}
            />
          ) : (
            <div style={{ width: "14px", height: "14px" }} />
          )}
        </div>

        {/* File/Folder Icon */}
        <div
          style={{
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10px",
          }}
        >
          <EuiIcon
            type={hasChildren ? (isExpanded ? "folderOpen" : "folderClosed") : "document"}
            size="m"
            style={{ 
              color: hasChildren ? "#0077CC" : "#69707D",
              transition: "color 0.15s ease"
            }}
          />
        </div>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <EuiText
            size="s"
            style={{
              fontWeight: isSelected ? "600" : "normal",
              color: isSelected ? "#0077CC" : "#343741",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "14px",
              lineHeight: "20px",
            }}
            title={node.title}
          >
            {node.title}
          </EuiText>
        </div>

        {/* Action Buttons */}
        {(isHovered || isSelected || isPopoverOpen) && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "4px",
            flexShrink: 0,
            background: "#eee",
            borderRadius: "4px",
            padding: "2px",
            position: "absolute",
            right: "4px",
          }}>
            {/* Add Subpage Button */}
            <EuiButtonIcon
              iconType="plus"
              aria-label={`${node.title}-д дэд хуудас нэмэх`}
              title={`${node.title}-д дэд хуудас нэмэх`}
              onClick={(e) => {
                e.stopPropagation();
                onAddSubpage(node.id);
              }}
              color="text"
              size="s"
              display="empty"
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: "transparent",
              }}
            />

            {/* Context Menu Button */}
            <EuiPopover
              id={`contextMenu_${node.id}`}
              button={
                <EuiButtonIcon
                  iconType="boxesHorizontal"
                  aria-label={`${node.title}-ны үйлдлүүд`}
                  onClick={openPopover}
                  display="empty"
                  isSelected={isPopoverOpen}
                  color="text"
                  size="s"
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: isPopoverOpen ? "#e3f2fd" : "transparent",
                  }}
                />
              }
              isOpen={isPopoverOpen}
              closePopover={closePopover}
              panelPaddingSize="none"
              anchorPosition="downRight"
              hasArrow={false}
            >
              <EuiContextMenuPanel
                size="s"
                items={[
                  <EuiContextMenuItem
                    key="rename"
                    icon="pencil"
                    onClick={() => handleAction(() => onRename(node.id))}
                  >
                    Нэр өөрчлөх
                  </EuiContextMenuItem>,
                  <EuiContextMenuItem
                    key="delete"
                    icon="trash"
                    onClick={() => handleAction(() => onDelete(node.id))}
                    color="danger"
                  >
                    Устгах
                  </EuiContextMenuItem>,
                ]}
              />
            </EuiPopover>
          </div>
        )}
      </div>

      {/* Render Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              selectedItemId={selectedItemId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onRename={onRename}
              onDelete={onDelete}
              onAddSubpage={onAddSubpage}
            />
          ))}
        </div>
      )}
    </>
  );
};

const CustomTreeView: React.FC<CustomTreeViewProps> = ({
  selectedItemId,
  onSelectItem,
  refreshTrigger,
  onCreateNew,
  onRefresh,
}) => {
  const [treeItems, setTreeItems] = useState<TreeNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5; // Number of items per page

  const loadData = useCallback(async (page = 0) => {
    try {
      setIsLoading(true);
      const params = {
        offset: page + 1, // API might use 1-based indexing
        limit: pageSize,
      };
      const res = await knowledgeApi.getList(params);
      
      const parsedResults = res.results.map((item) => {
        let parsedBody = {};
        try {
          if (typeof item.body === "string") {
            parsedBody = JSON.parse(item.body);
          }
        } catch (error) {
          console.error(`Failed to parse body: ${item.body}:`, error);
          parsedBody = {};
        }
        return {
          ...item,
          body: parsedBody,
        };
      });
      
      setTreeItems(parsedResults);
      setTotalCount(res.total_count || 0);
      setTotalPages(res.total_pages);
      setCurrentPageIndex(page);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error loading knowledge base data:", error);
    }
  }, [pageSize]);

  useEffect(() => {
    loadData(0); // Start from first page
  }, [loadData, refreshTrigger]);

  const handlePageChange = useCallback((pageIndex: number) => {
    loadData(pageIndex);
  }, [loadData]);

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleRename = useCallback(async (nodeId: string) => {
    const node = findNodeById(treeItems, nodeId);
    if (!node) return;

    const newName = prompt(`"${node.title}" баримтын шинэ нэр:`, node.title);
    if (newName && newName !== node.title) {
      try {
        // Prepare the document data with proper JSON stringification
        const updateData = {
          ...node,
          title: newName,
          body: node.body ? JSON.stringify(node.body) : null
        };
        
        // Update the document via API
        await knowledgeApi.update(nodeId, updateData);
        
        // Update the local tree state
        setTreeItems(prevItems => {
          const updateNodeTitle = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.map(n => {
              if (n.id === nodeId) {
                return { ...n, title: newName };
              }
              if (n.children) {
                return { ...n, children: updateNodeTitle(n.children) };
              }
              return n;
            });
          };
          return updateNodeTitle(prevItems);
        });
        
        // Trigger refresh in parent component if callback provided
        onRefresh?.();
        
        console.log(`Successfully renamed ${nodeId} to ${newName}`);
      } catch (error) {
        console.error("Error renaming document:", error);
        alert("Баримтын нэр өөрчлөхөд алдаа гарлаа. Дахин оролдоно уу.");
      }
    }
  }, [treeItems, onRefresh]);

  const handleDelete = useCallback(async (nodeId: string) => {
    const node = findNodeById(treeItems, nodeId);
    if (!node) return;

    if (window.confirm(`"${node.title}" баримтыг устгахдаа итгэлтэй байна уу?`)) {
      try {
        // Delete the document via API
        await knowledgeApi.delete(nodeId);
        
        // Remove the node from local tree state
        setTreeItems(prevItems => {
          const removeNode = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.filter(n => {
              if (n.id === nodeId) {
                return false;
              }
              if (n.children) {
                n.children = removeNode(n.children);
              }
              return true;
            });
          };
          return removeNode(prevItems);
        });
        
        // If the deleted item was selected, clear selection
        if (selectedItemId === nodeId) {
          onSelectItem(null);
        }
        
        // Trigger refresh in parent component if callback provided
        onRefresh?.();
        
        console.log(`Successfully deleted ${nodeId}`);
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Баримт устгахад алдаа гарлаа. Дахин оролдоно уу.");
      }
    }
  }, [treeItems, selectedItemId, onSelectItem, onRefresh]);

  const handleAddSubpage = useCallback(async (parentNodeId: string) => {
    const subpageName = prompt("Шинэ дэд хуудасны нэр:");
    if (subpageName && subpageName.trim()) {
      try {
        // Create a new document as a subpage
        const newDocument = {
          title: subpageName.trim(),
          body: JSON.stringify({ blocks: [] }), // Initialize with empty EditorJS structure and proper JSON stringification
          type: "public",
          parent_id: parentNodeId // If your API supports parent-child relationships
        };
        
        const response = await knowledgeApi.create(newDocument);
        
        // For now, we'll just reload the data since the tree structure might be complex
        // In a more sophisticated implementation, you'd update the tree state directly
        await loadData(currentPageIndex); // Reload current page
        
        // Expand the parent node to show the new subpage
        setExpandedIds(prev => new Set([...prev, parentNodeId]));
        
        // Trigger refresh in parent component if callback provided
        onRefresh?.();
        
        console.log(`Successfully created subpage "${subpageName}" under ${parentNodeId}`);
      } catch (error) {
        console.error("Error creating subpage:", error);
        alert("Дэд хуудас үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
      }
    }
  }, [loadData, onRefresh, currentPageIndex]);

  const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    return (
      <TreeNodeComponent
        key={node.id}
        node={node}
        level={level}
        selectedItemId={selectedItemId}
        expandedIds={expandedIds}
        onSelect={onSelectItem}
        onToggleExpand={handleToggleExpand}
        onRename={handleRename}
        onDelete={handleDelete}
        onAddSubpage={handleAddSubpage}
      />
    );
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with New Document Button */}
      <EuiFlexGroup
        alignItems="center"
        justifyContent="spaceBetween"
        gutterSize="s"
        style={{
          padding: "12px 16px 8px 16px",
          borderBottom: "1px solid #d3dae6",
          marginBottom: "4px",
          backgroundColor: "#fafbfd",
          flexGrow: 0,
        }}
      >
        <EuiFlexItem grow={true}>
          <EuiText size="s" color="subdued">
            <strong>Мэдлэгийн сан</strong>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType="plus"
            aria-label="Шинийг үүсгэх"
            title="Шинийг үүсгэх"
            onClick={onCreateNew}
            color="primary"
            size="s"
            display="base"
            style={{
              backgroundColor: "#0077CC",
              color: "white",
              borderRadius: "4px",
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>

      {/* Tree Content */}
      <div style={{ 
        padding: "8px 4px",
        height: "calc(100% - 120px)", // Adjusted height to accommodate pagination
        overflow: "auto",
        scrollBehavior: "smooth",
        flexGrow: 1,
      }}>
        {isLoading ? (
          <div style={{ 
            padding: "20px", 
            textAlign: "center",
            color: "#69707D",
            fontSize: "14px"
          }}>
            Ачааллаж байна...
          </div>
        ) : treeItems.length > 0 ? (
          <>
            {treeItems.map((node) => renderNode(node, 0))}
          </>
        ) : (
          <div style={{ 
            padding: "20px", 
            textAlign: "center",
            color: "#69707D",
            fontSize: "14px"
          }}>
            Баримт олдсонгүй
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          padding: "8px 16px",
          borderTop: "1px solid #d3dae6",
          backgroundColor: "#fafbfd",
          flexGrow: 0,
        }}>
          <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiText size="xs" color="subdued">
                Нийт: {totalCount} баримт
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPagination
                aria-label="Knowledge base pagination"
                pageCount={totalPages}
                activePage={currentPageIndex}
                onPageClick={handlePageChange}
                compressed
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      )}
    </div>
  );
};

export default CustomTreeView;
