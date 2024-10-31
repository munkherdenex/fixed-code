import {
  EuiCollapsibleNav,
  EuiCollapsibleNavGroup,
  EuiFlexItem,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiPinnableListGroup,
  EuiPinnableListGroupItemProps,
  logicalCSSWithFallback,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { css } from "@emotion/react";
import { useRouter } from "next/router";
import { useState } from "react";
import SideMenu from "./sidebar_menu";

const pathPrefix = process.env.PATH_PREFIX;

const CollapsibleNav = () => {
  const router = useRouter();

  const CustomersLinks: EuiPinnableListGroupItemProps[] = [
    {
      label: "Audience",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/audience`);
      },
      pinnable: false,
      color: router.pathname === "/dashboards/audience" ? "primary" : "subdued",
    },
    {
      label: "Segments",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/segments`);
      },
      pinnable: false,
      color: router.pathname === "/dashboards/segments" ? "primary" : "subdued",
    },
    {
      label: "Campaign",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/campaign`);
      },
      pinnable: false,
      color: router.pathname === "/dashboards/campaign" ? "primary" : "subdued",
    },
  ];

  // const ManagementLinks: EuiPinnableListGroupItemProps[] = [
  //   {
  //     label: "Custom attributes",
  //     onClick: () => {
  //       router.push(`${pathPrefix}/dashboards/custom_attribute`);
  //     },
  //     pinnable: false,
  //     color: router.pathname === "/dashboards/custom_attribute" ? "primary" : "subdued",
  //   },
  //   {
  //     label: "Channels",
  //     onClick: () => {
  //       router.push(`${pathPrefix}/dashboards/channels`);
  //     },
  //     pinnable: false,
  //     color: router.pathname === "/dashboards/channels" ? "primary" : "subdued",
  //   },
  //   {
  //     label: "Team",
  //     onClick: () => {
  //       router.push(`${pathPrefix}/dashboards/management`);
  //     },
  //     pinnable: false,
  //     color: router.pathname === "/dashboards/management" ? "primary" : "subdued",
  //   },
  //   {
  //     label: "API keys",
  //     onClick: () => {
  //       router.push(`${pathPrefix}/dashboards/management/api-keys`);
  //     },
  //     pinnable: false,
  //     color: router.pathname === "/dashboards/management/api-keys" ? "primary" : "subdued",
  //   },
  // ];

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
    if (!item || pinnedItems.filter((pinnedItem) => pinnedItem.label === item.label)) {
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

  // function addLinkNameToUnpinTitle(listItem: EuiPinnableListGroupItemProps) {
  //   return `Unpin ${listItem.label}`;
  // }

  const collapsibleNavId = useGeneratedHtmlId({ prefix: "collapsibleNav" });

  return (
    <EuiCollapsibleNav
      ownFocus={false}
      css={css`
        min-height: calc(100vh - 48px);
        display: flex;
        @media (max-height: 15em) {
          ${logicalCSSWithFallback("overflow-y", "auto")}
        }
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
      // Accessibility - Add scroll to nav on very small screens
      onClose={() => setNavIsOpen(false)}
    >
      {/* Shaded pinned section always with a home item */}
      <EuiFlexItem
        grow={false}
        className="eui-yScroll"
        // Accessibility - Allows nav items to be seen and interacted with on very small screen sizes
        css={css`
          @media (max-height: 15em) {
            flex: 1 0 auto;
          }
        `}
      >
        <EuiCollapsibleNavGroup
          title={
            <a className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Main menu
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
        {/* Span fakes the nav group into not being the first item and therefore adding a top border */}
        <span />
        <EuiCollapsibleNavGroup>
          <SideMenu />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
    </EuiCollapsibleNav>
  );
};

export default CollapsibleNav;
