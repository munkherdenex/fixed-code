import {
  EuiAvatar,
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormControlLayout,
  EuiPopover,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import { Fragment, useState } from "react";

const MembersPopover = ({ member }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen1) => !isPopoverOpen1);
  const closePopover = () => setIsPopoverOpen(false);

  return (
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
      <EuiText size="s" style={{ width: 300 }}>
        <p>Actions</p>
      </EuiText>
    </EuiPopover>
  );
};

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

  return (
    <>
      {members.map((member) => (
        <>
          <EuiSpacer size="xs" />
          <EuiFlexGroup
            key={member.id}
            gutterSize="s"
            alignItems="center"
            justifyContent="spaceBetween"
          >
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
              <MembersPopover member={member} />
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

export default TeamMembersComponent;
