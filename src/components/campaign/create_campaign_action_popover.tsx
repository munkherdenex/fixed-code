import { EuiButton, EuiPopover, EuiContextMenu } from "@elastic/eui";
import { useState, useCallback, useMemo } from "react";
import { TEMPLATE_DATA_TYPE_OPTIONS } from "../../constants";
import { commonStyles } from "../../styles/global.styles";
import CreateTemplateFlyot from "./create_template_flyot";
import { useTranslations } from "next-intl";

const CreateCampaignActionPopover = ({}) => {
  const common = commonStyles();
  const translate = useTranslations();

  const [isPopoverOpen, setPopover] = useState(false);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [dataType, setDataType] = useState<any>("");

  const onButtonClick = useCallback(() => {
    setPopover(!isPopoverOpen);
  }, [isPopoverOpen]);

  const closePopover = () => {
    setPopover(false);
  };

  const openFlyout = (dataType: string) => {
    if (dataType === "") return;
    setDataType(dataType);
    setIsFlyoutVisible(true);
  };

  const closeFlyout = () => {
    setIsFlyoutVisible(false);
    setDataType("");
  };

  const panels = useMemo(
    () => [
      {
        id: 0,
        items: TEMPLATE_DATA_TYPE_OPTIONS.map((options) => {
          return {
            name: options.inputDisplay,
            disabled: options.disabled,
            onClick: () => {
              openFlyout(options.value);
              closePopover();
            },
          };
        }),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const button = useMemo(
    () => (
      <EuiButton iconType="arrowDown" iconSide="right" onClick={onButtonClick}>
        {translate("create_new_campaign")}
      </EuiButton>
    ),
    [onButtonClick, translate],
  );

  return (
    <>
      <EuiPopover
        button={button}
        isOpen={isPopoverOpen}
        closePopover={onButtonClick}
        panelPaddingSize="none"
        anchorPosition="downLeft"
      >
        <EuiContextMenu css={common.width130} initialPanelId={0} panels={panels} size="s" />
      </EuiPopover>
      {isFlyoutVisible && <CreateTemplateFlyot closeFlyout={closeFlyout} dataType={dataType} />}
    </>
  );
};

export default CreateCampaignActionPopover;
