import {
  EuiPanel,
  EuiText,
  EuiSpacer,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiSkeletonRectangle,
  EuiBadge,
} from "@elastic/eui";
import { Template } from "../../hooks/useGetTemplates";
import { useTranslations } from "next-intl";
import { useRouter } from "next-nprogress-bar";
import useGetCampaignAnalyticsTable from "../../hooks/useGetCampaignAnalyticsTable";

const CampaignStatusTable = () => {
  const router = useRouter();
  const translate = useTranslations();

  const { data, isLoading } = useGetCampaignAnalyticsTable({
    offset: '1',
    limit: '10',
  });

  const columns: Array<EuiBasicTableColumn<Template>> = [
    {
      field: "title",
      name: translate("title"),
    },
    {
      name: "Төлөв",
      render: (template) => {
        return (
          <div>
            <EuiBadge>{template?.total_count}</EuiBadge>
            <EuiBadge color="success">{template?.success_count}</EuiBadge>
            <EuiBadge color="danger">{template?.failed_count}</EuiBadge>
          </div>
        );
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

  return (
    <div>
      <EuiPanel>
        <EuiText>
          <h3>{translate("last_ten_campaign")}</h3>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={250}>
          <EuiBasicTable
            items={data?.results || []}
            rowHeader="firstName"
            columns={columns}
            rowProps={getRowProps}
          />
        </EuiSkeletonRectangle>
      </EuiPanel>
    </div>
  );
};

export default CampaignStatusTable;
