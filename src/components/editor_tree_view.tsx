// @ts-nocheck
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  EuiTreeView,
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
import "@elastic/eui/dist/eui_theme_light.css"; // Or dark theme
import { css } from "@emotion/react";
import knowledgeApi from "@/api/knowledge";

const myCss = css`{
  .euiTreeView__nodeLabel {
    width: 100% !important;
  }
}`;

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

// Simple recursive function to update a node (returns a *new* tree)
const updateNodeInTree = (nodes, id, updates) => {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children) {
      const updatedChildren = updateNodeInTree(node.children, id, updates);
      // Only create a new node object if children actually changed
      if (updatedChildren !== node.children) {
        return { ...node, children: updatedChildren };
      }
    }
    return node; // Return original node if no change
  });
};

// --- Initial Data (assuming same as before) ---
const initialPageData = [
  {
    id: "home",
    name: "Homepage",
    children: [
      { id: "home-about", name: "About Us", iconType: "document" },
      { id: "home-contact", name: "Contact", iconType: "document" },
    ],
  },
  {
    id: "products",
    name: "Products",
    children: [
      { id: "products-widget", name: "Widget Pro", iconType: "document" },
      {
        id: "products-gadget",
        name: "Gadget Plus",
        children: [
          { id: "gadget-specs", name: "Specifications", iconType: "document" },
          { id: "gadget-reviews", name: "Reviews", iconType: "document" },
        ],
      },
    ],
  },
  {
    id: "services",
    name: "Services",
  },
];

// --- The Component ---
const PageTreeView = ({ selectedItemId, onSelectItem }) => {
  const [treeItems, setTreeItems] = useState(initialPageData);
  const [activeItemIds, setActiveItemIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState({});
  // State specifically for the *currently open* popover
  const [activePopoverId, setActivePopoverId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      await knowledgeApi.getList({}).then((res) => {
        const parsedResults = res.results.map((item) => {
          let parsedBody = {};
          try {
            if (typeof item.body === "string") {
              parsedBody = JSON.parse(item.body);
            }
          } catch (error) {
            console.error(`Failed to parse body: ${item.body}:`, error);
            parsedBody = {}; // Fallback to an empty object
          }
          return {
            ...item,
            body: parsedBody,
          };
        });
        setTreeItems(parsedResults);
      });
    };

    loadData();
  }, []);

  // --- Context Menu Handlers ---
  const openPopover = (nodeId) => {
    setActivePopoverId(nodeId); // Set which popover should be open
  };

  const closePopover = () => {
    setActivePopoverId(null); // Clear the active popover ID
  };

  useEffect(() => {
    setActiveItemIds(selectedItemId ? [selectedItemId] : []);
  }, [selectedItemId]);

  // --- Action Handlers (ensure they close popover) ---
  const handleRename = (nodeId) => {
    console.log(`Rename action for node: ${nodeId}`);
    const currentName = findNodeById(treeItems, nodeId)?.name || "this page";
    const newName = prompt(`Enter new name for "${currentName}":`, currentName);
    closePopover(); // Close popover FIRST
    if (newName && newName !== currentName) {
      // In a real app, update your data source and then the state
      setTreeItems((prevItems) => updateNodeInTree(prevItems, nodeId, { name: newName }));
    }
  };

  const handleDelete = (nodeId) => {
    console.log(`Delete action for node: ${nodeId}`);
    const nodeName = findNodeById(treeItems, nodeId)?.name || "this page";
    closePopover(); // Close popover FIRST
    if (window.confirm(`Are you sure you want to delete "${nodeName}"?`)) {
      alert(`Simulating delete for ${nodeId}. Implement actual deletion logic.`);
      // In a real app, update your data source and then the state
      // This would involve a recursive function to remove the node.
    }
  };

  // --- Add Subpage Handler ---
  const handleAddSubpage = (parentNodeId) => {
    console.log(`Add subpage action for parent node: ${parentNodeId}`);
    const parentName = findNodeById(treeItems, parentNodeId)?.name || "this page";
    const subpageName = prompt(`Enter name for new subpage under "${parentName}":`);
    if (subpageName) {
      const newNode = {
        id: `${parentNodeId}-${subpageName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        name: subpageName,
        iconType: "document",
      };

      setTreeItems((prevItems) => {
        const addSubpageRecursive = (nodes) => {
          return nodes.map((node) => {
            if (node.id === parentNodeId) {
              return {
                ...node,
                children: [...(node.children || []), newNode],
                isExpanded: true, // Ensure parent is expanded
              };
            }
            if (node.children) {
              const updatedChildren = addSubpageRecursive(node.children);
              if (updatedChildren !== node.children) {
                return { ...node, children: updatedChildren };
              }
            }
            return node;
          });
        };
        return addSubpageRecursive(prevItems);
      });

      setExpandedIds((prev) => ({ ...prev, [parentNodeId]: true }));
    }
  };

  const handleSelect = (node) => {
    const selectedNode = findNodeById(treeItems, node.id);
    if (selectedNode) {
      onSelectItem(selectedNode); // Pass the full node object up
    }
  };

  // --- Tree Expansion Handler ---
  const handleExpansion = useCallback(
    (nodeId) => {
      setExpandedIds((prev) => {
        const newExpandedIds = { ...prev };
        if (newExpandedIds[nodeId]) {
          delete newExpandedIds[nodeId];
        } else {
          newExpandedIds[nodeId] = true;
        }
        return newExpandedIds;
      });
      // Optional: Update node icon based on expansion state if using folder icons
      // Note: This state update might conflict slightly if EuiTreeView also updates internal state
      setTreeItems((prevItems) =>
        updateNodeInTree(prevItems, nodeId, { isExpanded: !expandedIds[nodeId] }),
      );
    },
    [expandedIds],
  );

  // --- Map Data to EuiTreeView Format ---
  const displayNodes = useMemo(() => {
    const mapNodes = (nodes, level = 0) => {
      return nodes.map((node) => {
        // Determine icon
        let icon;
        const isExpanded = !!expandedIds[node.id]; // Use consistent expansion check
        if (node.children && node.children.length > 0) {
          icon = <EuiIcon type={isExpanded ? "folderOpen" : "folderClosed"} />;
        } else {
          icon = <EuiIcon type={"document"} />;
        }

        const isPopoverOpen = activePopoverId === node.id; // Check if *this* node's popover should be open
        const isHovered = hoveredNodeId === node.id;
        const isSelected = selectedItemId === node.id;

        // --- Custom Label Component ---
        const customLabel = (
          <EuiFlexGroup
            alignItems="center"
            justifyContent="spaceBetween"
            gutterSize="s"
            responsive={false}
            className="pageTreeViewRow"
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
            onClick={() => handleSelect(node)}
            style={{
              borderRadius: "5px",
              width: "100%",
              paddingLeft: `${0.7 * level}em`,
            }}
          >
            {/* Grow=true pushes buttons to the right */}
            <EuiFlexItem grow={true}>
              <EuiFlexGroup gutterSize='xs' alignItems="flexStart" style={{ color: isSelected ? "black" : "grey" }}>
                <EuiFlexItem grow={false}>{icon}</EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="s" title={node.title}>
                    {node.title}
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiBadge color={node.status === "published" ? "success" : "hollow"} style={{ marginLeft: "8px" }}>
                    {node.status === "published" ? "Published" : "Draft"}
                  </EuiBadge>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>

            {/* Buttons Container */}
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                {/* Context Menu Button */}
                <EuiFlexItem grow={false}>
                  <EuiPopover
                    id={`contextMenu_${node.id}`}
                    button={
                      isHovered && (
                        <EuiButtonIcon
                          iconType="boxesHorizontal"
                          aria-label={`Actions for ${node.title}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent tree node click
                            openPopover(node.id);
                          }}
                          // Make button more visible when popover is open OR row is hovered
                          display="empty"
                          isSelected={isPopoverOpen} // Visually indicate when open
                          color="text"
                          size="s"
                        />
                      )
                    }
                    isOpen={isPopoverOpen} // Use the derived boolean
                    closePopover={closePopover} // EUI calls this on outside click/esc
                    panelPaddingSize="none"
                    anchorPosition="downRight"
                    // Ensure popover closes if the button itself is clicked again while open
                    // EUI might handle this, but being explicit can help in complex cases
                    hasArrow={false} // Context menus usually don't need arrows
                  >
                    <EuiContextMenuPanel
                      size="s"
                      items={[
                        <EuiContextMenuItem
                          key="rename"
                          icon="pencil"
                          onClick={() => handleRename(node.id)}
                        >
                          Rename
                        </EuiContextMenuItem>,
                        <EuiContextMenuItem
                          key="delete"
                          icon="trash"
                          onClick={() => handleDelete(node.id)}
                          color="danger"
                        >
                          Delete Page
                        </EuiContextMenuItem>,
                      ]}
                    />
                  </EuiPopover>
                </EuiFlexItem>

                {/* Add Subpage Button - Visible on Hover */}
                <EuiFlexItem grow={false}>
                  {isHovered && (
                    <EuiButtonIcon
                      iconType="plusInCircle"
                      aria-label={`Add subpage to ${node.title}`}
                      title={`Add subpage to ${node.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSubpage(node.id);
                      }}
                      color="text"
                      size="s"
                    />
                  )}
                  {/* Placeholder */}
                  {hoveredNodeId !== node.id && (
                    <div style={{ width: "24px", height: "24px" }} aria-hidden="true" />
                  )}
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        );

        return {
          id: node.id,
          label: customLabel,
          isExpanded: isExpanded, // Pass expansion state
          // Using `onExpansion` prop on EuiTreeView is preferred over `callback` for expansion control
          children: node.children ? mapNodes(node.children, level + 1) : undefined,
        };
      });
    };

    // Update dependencies for useMemo
    return mapNodes(treeItems);
  }, [treeItems, expandedIds, activePopoverId, hoveredNodeId, selectedItemId, handleExpansion]); // Added activePopoverId

  return (
    <EuiTreeView
      items={displayNodes}
      aria-label="Page Structure Tree View"
      display="default"
      css={myCss}
    />
  );
};

export default PageTreeView;
