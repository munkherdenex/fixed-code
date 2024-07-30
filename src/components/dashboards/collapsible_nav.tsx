import {
  EuiCollapsibleNav,
  EuiCollapsibleNavGroup,
  EuiFlexItem,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiPinnableListGroup,
  EuiPinnableListGroupItemProps,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { css } from "@emotion/react";
import find from "lodash/find";
import { useRouter } from "next/router";
import { useState } from "react";

const pathPrefix = process.env.PATH_PREFIX;

const CollapsibleNav = () => {
  const router = useRouter();

  const SendsLinks: EuiPinnableListGroupItemProps[] = [
    {
      label: "Campaign",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/campaign`);
      },
      pinnable: false,
    },
    {
      label: "Channels",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/channels`);
      },
      pinnable: false,
    },
    // {
    //   label: "Analytics",
    //   onClick: () => {
    //     router.push(`${pathPrefix}/dashboards/analytics`);
    //   },
    //   pinnable: false,
    // },
  ];

  const CustomersLinks: EuiPinnableListGroupItemProps[] = [
    {
      label: "Audience",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/audience`);
      },
      pinnable: false,
    },
    {
      label: "Custom attributes",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/custom_attribute`);
      },
      pinnable: false,
    },
    {
      label: "Segments",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/segments`);
      },
      pinnable: false,
    },
  ];

  const ManagementLinks: EuiPinnableListGroupItemProps[] = [
    {
      label: "Profile",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/management/profile`);
      },
      pinnable: false,
    },
    {
      label: "Security",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/management/security`);
      },
      pinnable: false,
    },
    {
      label: "Team",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/management`);
      },
      pinnable: false,
    },
    {
      label: "API keys",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/management/api-keys`);
      },
      pinnable: false,
    },
  ];

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

  function alterLinksWithCurrentState(
    links: EuiPinnableListGroupItemProps[],
    showPinned = false,
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
        min-height: calc(100vh - 48px);
        display: flex;
      `}
      id={collapsibleNavId}
      aria-label="Main navigation"
      isOpen={navIsOpen}
      button={
        <EuiHeaderSectionItemButton
          aria-label="Toggle main navigation"
          onClick={() => setNavIsOpen(!navIsOpen)}
        >
          <EuiIcon type={"menu"} size="m" aria-hidden="true" />
        </EuiHeaderSectionItemButton>
      }
      onClose={() => setNavIsOpen(false)}
    >
      {/* Shaded pinned section always with a home item */}
      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup
          title={
            <a className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Audience & Segment
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

      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup
          title={
            <a className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Notifications
            </a>
          }
          buttonElement="div"
          iconType="spacesApp"
          isCollapsible={true}
          initialIsOpen={openGroups.includes("Campaign")}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, "Campaign")}
        >
          <EuiPinnableListGroup
            aria-label="Campaign" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
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

      <EuiFlexItem grow={false}>
        <EuiCollapsibleNavGroup
          title={
            <span className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Settings
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
