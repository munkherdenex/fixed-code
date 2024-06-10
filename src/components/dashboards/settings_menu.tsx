import {
  EuiAvatar,
  EuiButton,
  EuiCode,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormControlLayout,
  EuiIcon,
  EuiPopover,
  EuiPopoverFooter,
  EuiPopoverTitle,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
} from "@elastic/eui";
import { Fragment, useMemo, useState } from "react";

const MembersComponent = () => {
  const members = [
    {
      id: 1,
      name: "John Doe",
      email: "john@gmail.com",
    },
    {
      id: 2,
      name: "John Doe",
      email: "john@gmail.com",
    },
  ];

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen1) => !isPopoverOpen1);
  const closePopover = () => setIsPopoverOpen(false);

  return (
    <>
      {members.map((member) => (
        <>
          <EuiSpacer size="xs" />
          <EuiFlexGroup key={member.id} gutterSize="s" alignItems="center" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiAvatar size="m" name={member.name} />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGroup direction="column" gutterSize="none">
                <EuiFlexItem grow={false}>
                  <EuiText size="xs">{member.name}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs">{member.email}</EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPopover
                id={member.id.toString()}
                key={member.id}
                panelPaddingSize="s"
                button={
                  <EuiButton size="s" onClick={onButtonClick}>
                    edit
                  </EuiButton>
                }
                isOpen={isPopoverOpen}
                closePopover={closePopover}
              >
                <EuiPopoverTitle>Hello, I&rsquo;m a popover title</EuiPopoverTitle>
                <EuiText size="s" style={{ width: 300 }}>
                  <p>
                    Only changing the <EuiCode>panelPaddingSize</EuiCode> will get inherited by the title.
                  </p>
                </EuiText>
                <EuiPopoverFooter>
                  <EuiButton fullWidth size="s">
                    Footer button
                  </EuiButton>
                </EuiPopoverFooter>
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      ))}
    </>
  );
};

const TeamMembersComponent = () => {
  return (
    <Fragment>
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <EuiFormControlLayout append={<EuiButton fill>Invite</EuiButton>}>
            <EuiFieldText
              type="text"
              controlOnly
              aria-label="Use aria labels when no actual label is in use"
              placeholder="john@mail.com"
            />
          </EuiFormControlLayout>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <MembersComponent />
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};

const tabs = [
  {
    id: "teamMembers--id",
    name: "Team members",
    prepend: <EuiIcon type="users" />,
    content: <TeamMembersComponent />,
  },
];

const SettingsMenu = () => {
  const [selectedTabId, setSelectedTabId] = useState("teamMembers--id");

  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId]);

  const onSelectedTabChanged = (id: string) => {
    setSelectedTabId(id);
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        key={index}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
        prepend={tab.prepend}
      >
        {tab.name}
      </EuiTab>
    ));
  };

  return (
    <div>
      <EuiTabs>{renderTabs()}</EuiTabs>
      <EuiSpacer />
      {selectedTabContent}
    </div>
  );
};

export default SettingsMenu;
