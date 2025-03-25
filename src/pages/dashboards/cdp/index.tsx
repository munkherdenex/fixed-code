// @ts-nocheck

import { FunctionComponent, useEffect, useState } from "react";
import Head from "next/head";
import {
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiTextColor,
} from "@elastic/eui";
import { useRouter } from "next/router";
import MetricChart from "../../../components/metric-chart";
import DashboardLayout from "../../../layouts/dashboard";
import templateApi from "@/api/template";
import { Template } from "@/hooks/useGetTemplates";
import { getCampaignIcon, getCampaignStatusIcon, getDataKind } from "@/utils/helper";
import { badgeColor } from "@/utils/badge_color";
import { useTranslations } from "next-intl";
import moment from "moment";
import { Worker } from "@/lib/types";
import Link from "next/link";

interface TemplateListResponse {
  results: any[]; // Replace `any` with the actual type of the items in the array
}

const Dashboard: FunctionComponent = () => {
  const router = useRouter();
  const translate = useTranslations();

  const [templateListData, setTemplateListData] = useState<TemplateListResponse | null>(null);

  useEffect(() => {
    templateApi.getList().then((res) => {
      setTemplateListData(res.data);
    });
  }, []);

  const columns: Array<EuiBasicTableColumn<Template>> = [
    {
      field: "title",
      name: translate("title"),
      "data-test-subj": "titleCell",
    },
    {
      name: translate("kind"),
      "data-test-subj": "kindCell",
      render: (template: Template) => {
        //INFO: This is a workaround to get the kind of the template becaouse of POCKET
        const dataKind = getDataKind(template);

        return (
          <span>
            <EuiIcon
              aria-label={dataKind}
              type={getCampaignIcon(dataKind)}
              color={badgeColor(dataKind)}
            />{" "}
            <EuiTextColor color={badgeColor(dataKind)}>{dataKind.toUpperCase()}</EuiTextColor>
          </span>
        );
      },
    },
    {
      name: translate("status"),
      render: (template: Template) => {
        const { status, start_date, is_recurring } = template;

        const iconType = getCampaignStatusIcon(start_date != null, is_recurring);

        return (
          <span>
            <EuiIcon type={iconType} color={badgeColor(status)} />{" "}
            <EuiBadge color={badgeColor(status)}>{status}</EuiBadge>
          </span>
        );
      },
    },
    {
      name: translate("aud_count"),
      render: (template: Template) => {
        const { is_to_all, aud_count } = template;

        return <span>{is_to_all ? translate("all_customer") : aud_count}</span>;
      },
    },
    {
      name: translate("click_count"),
      render: (template: Template) => {
        return template.status == "DRAFT" || template.status == "DONE"
          ? "-"
          : template.click_count;
      },
    },
    {
      field: "created_at",
      name: translate("created_at"),
      "data-test-subj": "createdAtCell",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
    },
    {
      field: "created_by",
      name: translate("created_by"),
      "data-test-subj": "createdByCell",
      render: (worker: Worker) => {
        return worker?.email;
      },
      footer: () => {
        return <Link href="/dashboards/cdp/campaign">Бүгдийг үзэх</Link>;
      },
    },
  ];

  const getRowProps = (template: Template) => {
    const { id } = template;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/cdp/campaign/info/${id}`),
    };
  };

  const getCellProps = (template: Template, column: EuiTableFieldDataColumnType<Template>) => {
    const { id } = template;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <DashboardLayout pageHeader={{ pageTitle: "Сайн байна уу" }}>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <MetricChart />
          </EuiFlexItem>
          <EuiFlexItem direction="column">
            <EuiText>
              <h3>Мэдэгдэл</h3>
            </EuiText>
            <EuiBasicTable
              tableCaption="CDP"
              items={templateListData?.results || []}
              rowHeader="firstName"
              columns={columns}
              rowProps={getRowProps}
              cellProps={getCellProps}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </DashboardLayout>
    </>
  );
};

export async function getStaticProps(context) {
  const common = (await import(`../../../messages/${context.locale}/common.json`)).default;
  const cdp = await import(`../../../messages/${context.locale}.json`);
  const campaign = await import(`../../../messages/${context.locale}/campaign.json`);

  return {
    props: {
      messages: {
        ...common,
        ...cdp,
        ...campaign,
      },
    },
  };
}

export default Dashboard;
