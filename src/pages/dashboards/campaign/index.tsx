import { EuiBreadcrumbs, EuiButton, EuiContextMenu, EuiPopover } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import CreateTemplateFlyot from "../../../components/campaign/create_template_flyot";
import SendsTable from "../../../components/campaign/table";
import { TEMPLATE_DATA_TYPE_OPTIONS } from "../../../constants";
import DashboardLayout from "../../../layouts/dashboard";
import { commonStyles } from "../../../styles/global.styles";

const pathPrefix = process.env.PATH_PREFIX;

const SendsDashboard = () => {
  const router = useRouter();
  const cStyles = commonStyles();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [dataType, setDataType] = useState<any>("");
  const [isPopoverOpen, setPopover] = useState(false);

  const onButtonClick = useCallback(() => {
    setPopover(!isPopoverOpen);
  }, [isPopoverOpen]);

  const closePopover = () => {
    setPopover(false);
  };

  const closeFlyout = () => {
    setIsFlyoutVisible(false);
    setDataType("");
  };

  const openFlyout = (dataType: string) => {
    if (dataType === "") return;
    if (dataType === TEMPLATE_DATA_TYPE_OPTIONS[0].value) {
      router.push(`${pathPrefix}/dashboards/campaign/create/email`);
      return;
    }
    setDataType(dataType);
    setIsFlyoutVisible(true);
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
    [],
  );

  const button = useMemo(
    () => (
      <EuiButton iconType="arrowDown" iconSide="right" onClick={onButtonClick}>
        Create new
      </EuiButton>
    ),
    [onButtonClick],
  );

  const rightSideItem = useMemo(
    () => (
      <EuiPopover
        key="create-campaign"
        button={button}
        isOpen={isPopoverOpen}
        closePopover={closePopover}
        panelPaddingSize="none"
        anchorPosition="downLeft"
      >
        <EuiContextMenu css={cStyles.width130} initialPanelId={0} panels={panels} size="s" />
      </EuiPopover>
    ),
    [button, isPopoverOpen, panels, cStyles.width130],
  );

  return (
    <>
      <Head>
        <title>Campaign</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Campaign",
          iconType: "spacesApp",
          rightSideItems: [rightSideItem],
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push(`${pathPrefix}/dashboards`),
              },
              {
                text: "Campaign",
              },
            ]}
            truncate={false}
          />
        }
      >
        <div>
          <SendsTable createCampaignAction={rightSideItem} />
          {isFlyoutVisible && <CreateTemplateFlyot closeFlyout={closeFlyout} dataType={dataType} />}
        </div>
      </DashboardLayout>
    </>
  );
};

export default SendsDashboard;
