import { EuiButton, EuiPopover, EuiContextMenu } from "@elastic/eui";
import { useState, useCallback, useMemo } from "react";
import { commonStyles } from "../../styles/global.styles";
import AddAudienceFlyout from "./add_audience_flyot";

const DATA_TYPE_OPTIONS = [
  { inputDisplay: "Customer", value: "customer" },
  { inputDisplay: "Segment", value: "segment" },
];

const AddAudience = () => {
  const cStyles = commonStyles();

  const [isAddAudienceFlyoutVisible, setIsAddAudienceFlyoutVisible] = useState(false);
  const [isPopoverOpen, setPopover] = useState(false);
  const [dataType, setDataType] = useState<any>("customer");

  const closeFlyout = () => {
    setIsAddAudienceFlyoutVisible(false);
  };

  const onButtonClick = useCallback(() => {
    setPopover(!isPopoverOpen);
  }, [isPopoverOpen]);

  const button = useMemo(
    () => (
      <EuiButton iconType="arrowDown" iconSide="right" onClick={onButtonClick}>
        Add audience
      </EuiButton>
    ),
    [onButtonClick],
  );

  const panels = useMemo(
    () => [
      {
        id: 0,
        items: DATA_TYPE_OPTIONS.map((options) => {
          return {
            name: options.inputDisplay,
            onClick: () => {
              setIsAddAudienceFlyoutVisible(true);
              setPopover(false);
              setDataType(options.value);
            },
          };
        }),
      },
    ],
    [],
  );

  return (
    <div>
      <EuiPopover
        key="create-campaign"
        button={button}
        isOpen={isPopoverOpen}
        closePopover={closeFlyout}
        panelPaddingSize="none"
        anchorPosition="downLeft"
      >
        <EuiContextMenu css={cStyles.width130} initialPanelId={0} panels={panels} size="s" />
      </EuiPopover>
      {isAddAudienceFlyoutVisible && (
        <AddAudienceFlyout closeFlyout={closeFlyout} dataType={dataType} />
      )}
    </div>
  );
};

export default AddAudience;
