import find from "lodash/find";
import findIndex from "lodash/findIndex";
import { css } from "@emotion/react";
import { useState } from "react";
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
  EuiSelect,
  EuiThemeProvider,
  useEuiTheme,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { collapsibleNavStyles } from "./collapsible_nav.styles";

const pathPrefix = process.env.PATH_PREFIX;

const TopLinks: EuiPinnableListGroupItemProps[] = [
  {
    label: "Home",
    iconType: "home",
    isActive: true,
    "aria-current": true,
    href: `${pathPrefix}/kibana`,
    pinnable: false,
  },
];

const SegmentsLinks: EuiPinnableListGroupItemProps[] = [
  { label: "Dashboards", href: `${pathPrefix}/dashboards/segments` },
];

const KibanaLinks: EuiPinnableListGroupItemProps[] = [
  { label: "Discover", href: `${pathPrefix}/kibana/discover` },
  { label: "Dashboard", href: `${pathPrefix}/kibana/dashboards` },
  { label: "Maps", href: `${pathPrefix}/kibana/maps` },
];

const options = [
  { value: "Team 1", text: "Team 1" },
  { value: "Team 2", text: "Team 2" },
  { value: "Teams 3", text: "Team 3" },
];

const CollapsibleNav = () => {
  const { euiTheme } = useEuiTheme();
  const styles = collapsibleNavStyles(euiTheme);

  const [navIsOpen, setNavIsOpen] = useState(false);
  const [value, setValue] = useState();

  /**
   * Accordion toggling
   */
  const [openGroups, setOpenGroups] = useState(["Segments"]);

  const onChange = (e) => {
    setValue(e.target.value);
  };

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
  const [pinnedItems, setPinnedItems] = useState<EuiPinnableListGroupItemProps[]>([]);

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
        margin-top: 96px; // two top navs
        min-height: calc(100vh - 96px);
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
                  label: "Manage deployment",
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
      <EuiFlexItem grow={false} style={{ flexShrink: 0, padding: 8 }}>
        <EuiSelect
          id={useGeneratedHtmlId()}
          options={options}
          value={value}
          onChange={(e) => onChange(e)}
          aria-label="Teams"
          css={styles.teamSelect}
        />
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
            <a
              className="eui-textInheritColor"
              href="#/navigation/collapsible-nav"
              onClick={(e) => e.stopPropagation()}
            >
              Segments
            </a>
          }
          buttonElement="div"
          iconType="logoCloud"
          isCollapsible={true}
          initialIsOpen={openGroups.includes("Segments")}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, "Kibana")}
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
            <a
              className="eui-textInheritColor"
              href="#/navigation/collapsible-nav"
              onClick={(e) => e.stopPropagation()}
            >
              Analytics
            </a>
          }
          buttonElement="div"
          iconType="logoKibana"
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
    </EuiCollapsibleNav>
  );
};

export default CollapsibleNav;
