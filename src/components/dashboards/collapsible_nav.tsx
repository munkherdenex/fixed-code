import {
  EuiCollapsibleNav,
  EuiCollapsibleNavGroup,
  EuiFlexItem,
  EuiHeaderSectionItemButton,
  EuiHorizontalRule,
  EuiIcon,
  EuiListGroup,
  EuiPinnableListGroup,
  EuiPinnableListGroupItemProps,
  EuiThemeProvider,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { css } from "@emotion/react";
import find from "lodash/find";
import findIndex from "lodash/findIndex";
import { useState } from "react";

const pathPrefix = process.env.PATH_PREFIX;

const TopLinks: EuiPinnableListGroupItemProps[] = [
  {
    label: "Home",
    iconType: "home",
    isActive: true,
    "aria-current": true,
    href: `${pathPrefix}/dashboards`,
    pinnable: false,
  },
];

const SendsLinks: EuiPinnableListGroupItemProps[] = [
  { label: "Dashboards", href: `${pathPrefix}/dashboards/sends`, pinnable: false },
];

const CustomersLinks: EuiPinnableListGroupItemProps[] = [
  { label: "Dashboards", href: `${pathPrefix}/dashboards/customers`, pinnable: false },
];

const SegmentsLinks: EuiPinnableListGroupItemProps[] = [
  { label: "Dashboards", href: `${pathPrefix}/dashboards/segments`, pinnable: false },
];

const KibanaLinks: EuiPinnableListGroupItemProps[] = [
  { label: "Discover", href: `${pathPrefix}/kibana/discover`, pinnable: false },
  { label: "Dashboard", href: `${pathPrefix}/kibana/dashboards`, pinnable: false },
  { label: "Maps", href: `${pathPrefix}/kibana/maps`, pinnable: false },
];

const ManagementLinks: EuiPinnableListGroupItemProps[] = [
  { label: "Settings", href: `${pathPrefix}/dashboards/management`, pinnable: false },
];

const CollapsibleNav = () => {
  const [navIsOpen, setNavIsOpen] = useState(false);

  /**
   * Accordion toggling
   */
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    try {
      const storedOpenGroups = localStorage.getItem("openNavGroups");
      return storedOpenGroups ? JSON.parse(storedOpenGroups) : [];
    } catch (e) {
      return [];
    }
  });

  // Save which groups are open and which are not with state and local store
  const toggleAccordion = (isOpen: boolean, title?: string) => {
    if (!title) return;
    const itExists = openGroups.includes(title);
    if (isOpen) {
      if (itExists) return;
      openGroups.push(title);
    } else {
      const index = openGroups.indexOf(title);
      if (index > -1) {
        openGroups.splice(index, 1);
      }
    }
    setOpenGroups([...openGroups]);
    localStorage.setItem("openNavGroups", JSON.stringify(openGroups));
  };

  /**
   * Pinning
   */
  const [pinnedItems, setPinnedItems] = useState<EuiPinnableListGroupItemProps[]>(() => {
    try {
      const pinnedItems = localStorage.getItem("pinnedItems");
      return pinnedItems ? JSON.parse(pinnedItems) : [];
    } catch (e) {
      return [];
    }
  });

  const addPin = (item: EuiPinnableListGroupItemProps) => {
    if (!item || find(pinnedItems, { label: item.label })) {
      return;
    }
    item.pinned = true;
    const newPinnedItems = pinnedItems ? pinnedItems.concat(item) : [item];
    setPinnedItems(newPinnedItems);
    localStorage.setItem("pinnedItems", JSON.stringify(newPinnedItems));
  };

  const removePin = (item: EuiPinnableListGroupItemProps) => {
    const pinIndex = findIndex(pinnedItems, { label: item.label });
    if (pinIndex > -1) {
      item.pinned = false;
      const newPinnedItems = pinnedItems;
      newPinnedItems.splice(pinIndex, 1);
      setPinnedItems([...newPinnedItems]);
      localStorage.setItem("pinnedItems", JSON.stringify(newPinnedItems));
    }
  };

  function alterLinksWithCurrentState(
    links: EuiPinnableListGroupItemProps[],
    showPinned = false
  ): EuiPinnableListGroupItemProps[] {
    return links.map((link) => {
      const { pinned, ...rest } = link;
      return {
        pinned: showPinned ? pinned : false,
        ...rest,
      };
    });
  }

  function addLinkNameToPinTitle(listItem: EuiPinnableListGroupItemProps) {
    return `Pin ${listItem.label} to top`;
  }

  function addLinkNameToUnpinTitle(listItem: EuiPinnableListGroupItemProps) {
    return `Unpin ${listItem.label}`;
  }

  const collapsibleNavId = useGeneratedHtmlId({ prefix: "collapsibleNav" });

  return (
    <EuiCollapsibleNav
      ownFocus={false}
      css={css`
        margin-top: 48px; // two top navs
        min-height: calc(100vh - 48px);
        display: flex;
      `}
      id={collapsibleNavId}
      aria-label="Main navigation"
      isOpen={navIsOpen}
      button={
        <EuiHeaderSectionItemButton aria-label="Toggle main navigation" onClick={() => setNavIsOpen(!navIsOpen)}>
          <EuiIcon type={"menu"} size="m" aria-hidden="true" />
        </EuiHeaderSectionItemButton>
      }
      onClose={() => setNavIsOpen(false)}
    >
      {/* Dark deployments section */}
      <EuiFlexItem grow={false} style={{ flexShrink: 0 }}>
        <EuiCollapsibleNavGroup isCollapsible={false} background="dark">
          <EuiThemeProvider colorMode="dark">
            <EuiListGroup
              maxWidth="none"
              gutterSize="none"
              size="s"
              listItems={[
                {
                  label: "Manage data",
                  href: "#",
                  iconType: "logoCloud",
                  iconProps: {
                    color: "ghost",
                  },
                },
              ]}
            />
          </EuiThemeProvider>
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
      {/* Shaded pinned section always with a home item */}
      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup background="light">
          <EuiPinnableListGroup
            aria-label="Pinned links" // A11y : Since this group doesn't have a visible `title` it should be provided an accessible description
            listItems={alterLinksWithCurrentState(TopLinks).concat(alterLinksWithCurrentState(pinnedItems, true))}
            unpinTitle={addLinkNameToUnpinTitle}
            onPinClick={removePin}
            maxWidth="none"
            color="text"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
      <EuiHorizontalRule margin="none" />
      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup
          title={
            <a className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Sends
            </a>
          }
          buttonElement="div"
          iconType="spacesApp"
          isCollapsible={true}
          initialIsOpen={openGroups.includes("Sends")}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, "Sends")}
        >
          <EuiPinnableListGroup
            aria-label="Sends" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(SendsLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
      <EuiHorizontalRule margin="none" />
      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup
          title={
            <a className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Customers
            </a>
          }
          buttonElement="div"
          iconType="usersRolesApp"
          isCollapsible={true}
          initialIsOpen={openGroups.includes("Customers")}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, "Customers")}
        >
          <EuiPinnableListGroup
            aria-label="customers" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(CustomersLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
      <EuiHorizontalRule margin="none" />
      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup
          title={
            <a className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Segments
            </a>
          }
          buttonElement="div"
          iconType="notebookApp"
          isCollapsible={true}
          initialIsOpen={openGroups.includes("Segments")}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, "Segments")}
        >
          <EuiPinnableListGroup
            aria-label="Segments" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(SegmentsLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
      {/* Menu items */}
      <EuiHorizontalRule margin="none" />
      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup
          title={
            <span className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Analytics
            </span>
          }
          buttonElement="div"
          iconType="visualizeApp"
          isCollapsible={true}
          initialIsOpen={openGroups.includes("Kibana")}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, "Kibana")}
        >
          <EuiPinnableListGroup
            aria-label="Kibana" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(KibanaLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
      <EuiHorizontalRule margin="none" />
      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup
          title={
            <span className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Management
            </span>
          }
          buttonElement="div"
          iconType="managementApp"
          isCollapsible={true}
          initialIsOpen={openGroups.includes("management")}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, "management")}
        >
          <EuiPinnableListGroup
            aria-label="management" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(ManagementLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
    </EuiCollapsibleNav>
  );
};

export default CollapsibleNav;
