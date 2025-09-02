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
import Link from "next/link";

const pathPrefix = process.env.PATH_PREFIX;

const CollapsibleNav = () => {
  const router = useRouter();

  const CustomersLinks: EuiPinnableListGroupItemProps[] = [
    {
      label: "Харилцагч",
      icon: <EuiIcon type="userAvatar" />,
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/cdp/audience`);
      },
      pinnable: false,
      color: router.pathname === "/dashboards/cdp/audience" ? "primary" : "subdued",
    },
    {
      label: "Сегмент",
      icon: <EuiIcon type="users" />,
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/cdp/segments`);
      },
      pinnable: false,
      color: router.pathname === "/dashboards/cdp/segments" ? "primary" : "subdued",
    },
    {
      label: "Мэдэгдэл",
      icon: <EuiIcon type="inputOutput" />,
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/cdp/campaign`);
      },
      pinnable: false,
      color: router.pathname === "/dashboards/cdp/campaign" ? "primary" : "subdued",
    },
    {
      label: "Тайлан",
      icon: <EuiIcon type="document" />,
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/cdp/analytics`);
      },
      pinnable: false,
      color: router.pathname === "/dashboards/cdp/analytics" ? "primary" : "subdued",
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
          <EuiIcon type={"menu"} size="s" aria-hidden="true" />
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
            <Link href="/dashboards/cdp" className="eui-textInheritColor" onClick={(e) => e.stopPropagation()}>
              Нүүр
            </Link>
            
          }
          buttonElement="div"
          iconType="usersRolesApp"
          isCollapsible={true}
          initialIsOpen={openGroups.includes("Customers")}
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
