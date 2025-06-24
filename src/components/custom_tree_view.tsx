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
  onSelectItem: (node: TreeNode) => void;
  refreshTrigger: number;
  onCreateNew: () => void;
}

interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  selectedItemId: string | null;
  expandedIds: Set<string>;
  onSelect: (node: TreeNode) => void;
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

        {/* Status Badge */}
        <div style={{ marginRight: "8px", flexShrink: 0 }}>
          <EuiBadge
            color={node.status === "published" ? "success" : "hollow"}
            style={{ 
              fontSize: "11px",
              padding: "2px 6px",
              height: "20px",
              lineHeight: "16px"
            }}
          >
            {node.status === "published" ? "Published" : "Draft"}
          </EuiBadge>
        </div>

        {/* Action Buttons */}
        {(isHovered || isSelected || isPopoverOpen) && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "4px",
            flexShrink: 0,
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "4px",
            padding: "2px"
          }}>
            {/* Add Subpage Button */}
            <EuiButtonIcon
              iconType="plus"
              aria-label={`Add subpage to ${node.title}`}
              title={`Add subpage to ${node.title}`}
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
                  aria-label={`Actions for ${node.title}`}
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
                    Rename
                  </EuiContextMenuItem>,
                  <EuiContextMenuItem
                    key="delete"
                    icon="trash"
                    onClick={() => handleAction(() => onDelete(node.id))}
                    color="danger"
                  >
                    Delete Page
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
}) => {
  const [treeItems, setTreeItems] = useState<TreeNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      const res = await knowledgeApi.getList({});
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
    } catch (error) {
      console.error("Error loading knowledge base data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

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

  const handleRename = useCallback((nodeId: string) => {
    const node = findNodeById(treeItems, nodeId);
    if (!node) return;

    const newName = prompt(`Enter new name for "${node.title}":`, node.title);
    if (newName && newName !== node.title) {
      // Update the node in the tree
      // This is a simplified update - in a real app, you'd call an API
      console.log(`Renaming ${nodeId} to ${newName}`);
    }
  }, [treeItems]);

  const handleDelete = useCallback((nodeId: string) => {
    const node = findNodeById(treeItems, nodeId);
    if (!node) return;

    if (window.confirm(`Are you sure you want to delete "${node.title}"?`)) {
      console.log(`Deleting ${nodeId}`);
      // Implement actual deletion logic here
    }
  }, [treeItems]);

  const handleAddSubpage = useCallback((parentNodeId: string) => {
    const subpageName = prompt("Шинэ хуудасны нэр:");
    if (subpageName) {
      console.log(`Adding subpage "${subpageName}" to ${parentNodeId}`);
      // Implement actual subpage creation logic here
    }
  }, []);

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
    <div style={{ width: "100%", height: "100%" }}>
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
        height: "calc(100% - 60px)",
        overflow: "auto",
        scrollBehavior: "smooth"
      }}>
        {treeItems.length > 0 ? (
          treeItems.map((node) => renderNode(node, 0))
        ) : (
          <div style={{ 
            padding: "20px", 
            textAlign: "center",
            color: "#69707D",
            fontSize: "14px"
          }}>
            No documents found
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomTreeView;
