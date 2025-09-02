import { useState, useEffect } from "react";
import moment from "moment";
import {
  EuiDatePickerRange,
  EuiDatePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiButtonGroup,
} from "@elastic/eui";
import Head from "next/head";
import DashboardLayout from "../../../../layouts/dashboard";
import Customer from "../../../../components/analytics/customer";
import Campaign from "../../../../components/analytics/campaign";
import CampaignStatusTable from "../../../../components/analytics/campaign_status_table";
import CampaignActions from "@/components/analytics/campaign_actions";
import { useTranslations } from "next-intl";

const Analytics = () => {
  const translate = useTranslations();

  const [interval, setInterval] = useState<"1d" | "7d" | "1m">("7d");
  const [pickerRange, setPickerRange] = useState({
    start: moment().subtract(7, "days"),
    end: moment(),
  });

  useEffect(() => {
    if (interval === "1d") {
      setPickerRange({ start: moment().subtract(1, "days"), end: moment() });
    } else if (interval === "7d") {
      setPickerRange({ start: moment().subtract(7, "days"), end: moment() });
    } else if (interval === "1m") {
      setPickerRange({ start: moment().subtract(1, "month"), end: moment() });
    }
  }, [interval]);

  return (
    <>
      <Head>
        <title>{translate("analytics")}</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: translate("analytics"),
          iconType: "reportingApp",
        }}
      >
        <>
          <EuiFlexGroup gutterSize="m" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiDatePickerRange
                startDateControl={
                  <EuiDatePicker
                    selected={pickerRange.start}
                    onChange={(date) =>
                      setPickerRange({ ...pickerRange, start: date })
                    }
                  />
                }
                endDateControl={
                  <EuiDatePicker
                    selected={pickerRange.end}
                    onChange={(date) =>
                      setPickerRange({ ...pickerRange, end: date })
                    }
                  />
                }
              />
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButtonGroup
                legend="Select interval"
                idSelected={interval}
                onChange={(id) => setInterval(id as any)}
                options={[
                  { id: "1d", label: "1 өдөр" },
                  { id: "7d", label: "7 хоног" },
                  { id: "1m", label: "1 сар" },
                ]}
              />
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size="l" />

          <Campaign interval={interval} pickerRange={pickerRange} />
          <EuiSpacer size="l" />
          <CampaignActions interval={interval} pickerRange={pickerRange} />
          <EuiSpacer size="l" />
          <CampaignStatusTable />
          <EuiSpacer size="l" />
          <Customer interval={interval} pickerRange={pickerRange} />
        </>
      </DashboardLayout>
    </>
  );
};

export async function getStaticProps(context) {
  const campaign = (await import(`../../../../messages/${context.locale}/campaign.json`)).default;
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...campaign,
        ...common,
      },
    },
  };
}

export default Analytics;
