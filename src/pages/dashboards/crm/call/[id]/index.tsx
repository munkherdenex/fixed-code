import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiBreadcrumbs,
  EuiButtonIcon,
  EuiDescriptionList,
  EuiEmptyPrompt,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiSplitPanel,
  EuiText,
} from "@elastic/eui";
import contactLogApi from "@/api/contact_log";
import { addToast } from "@/components/toast";
import DashboardCRMLayout from "@/layouts/dashboard_crm";
import { callTypeOptions } from "@/components/call/table";
import { css } from "@emotion/react";
import useSWR from "swr";
import moment from "moment";
import { isNumber } from "@/utils/helper";
import { PAGINATION_CHOOSES } from "@/constants";

const CallDetailsPage = () => {
  const router = useRouter();
  const { query } = router;
  const { id } = query; // Read the [id] parameter from the URL
  const [callDetails, setCallDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialQueryState = {
    search: "99999999999",
    filter: query?.filter?.toString() || "",
    callState: query?.callState?.toString() || "",
    callType: query?.callType?.toString() || "",
    date: query?.date ? moment(query?.date) : null,
    offset: isNumber(query?.offset) ? +query?.offset : 0,
    limit: isNumber(query?.limit) ? +query?.limit : PAGINATION_CHOOSES[0],
  };

  const [queryState, setQueryState] = useState(initialQueryState);
  const pagination = {
    pageIndex: queryState.offset,
    pageSize: queryState.limit,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const {
    data: callHistory,
    isLoading: isLoadingHistory,
    mutate,
  } = useSWR(["/crm/calls/", queryState], () => contactLogApi.getCalls(queryState));

  useEffect(() => {
    const fetchCallDetails = async () => {
      try {
        setIsLoading(true);
        const data = await contactLogApi.getCallById(id);
        setCallDetails(data);
        setQueryState((prevState) => ({
          ...prevState,
          search: data.phone || prevState.search,
        }));
      } catch (error) {
        addToast({
          id: "error",
          title: "Дэлгэрэнгүй мэдээлэл авахад алдаа гарлаа",
          text: error.message || "Алдаа гарлаа",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCallDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <DashboardCRMLayout
        pageHeader={{
          pageTitle: "Дуудлагын дэлгэрэнгүй",
        }}
      >
        <>
          <EuiLoadingSpinner size="xl" />
          <EuiSpacer size="m" />
          <EuiText>Ачааллаж байна...</EuiText>
        </>
      </DashboardCRMLayout>
    );
  }

  if (!callDetails) {
    return (
      <DashboardCRMLayout
        pageHeader={{
          pageTitle: "Дуудлагын дэлгэрэнгүй",
        }}
      >
        <EuiText>Дуудлагын мэдээлэл олдсонгүй.</EuiText>
      </DashboardCRMLayout>
    );
  }

  const details = [
    { title: "Утасны дугаар", description: callDetails.phone },
    { title: "Дуудлагын төлөв", description: callDetails.call_state },
    { title: "Дуудлагын төрөл", description: callDetails.call_type },
    { title: "Дуудлага авсан ажилтан", description: callDetails.call_agent || "Хоосон" },
    { title: "Залгасан огноо", description: callDetails.call_date },
    { title: "Үргэлжлэх хугацаа", description: `${callDetails.duration || 0} секунд` },
  ];

  const columns: Array<EuiBasicTableColumn<any>> = [
    {
      field: "timestamp",
      name: "Огноо",
      dataType: "date",
      render: (phone: string, row: any) => (
        <span>
          <EuiIcon
            title={callTypeOptions.find((option) => option.value === row.call_type)?.label || ""}
            css={css`
              transform: rotate(45deg);
              margin-right: 0.3em;
            `}
            color={row.call_type === "inbound" ? "success" : "danger"}
            type={row.call_type === "inbound" ? "sortDown" : "sortUp"}
          />
          {phone}
        </span>
      ),
    },
    {
      field: "call_duration",
      name: "",
    },
    {
      field: "action",
      name: "Үйлдэл",
    },
  ];

  const onTableChange = ({ page }: Criteria<any>) => {
      if (page) {
        const updatedQueryState = {
          ...queryState,
          offset: page.index,
          limit: page.size,
        };
        setQueryState(updatedQueryState);
        router.push({ query: updatedQueryState });
      }
    };

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Дуудлагын дэлгэрэнгүй",
      }}
    >
      <>
        <EuiFlexGroup justifyContent="flexStart">
          <EuiFlexItem grow={0}>
            <EuiButtonIcon iconType={"arrowLeft"} display="base" color="text" />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiBreadcrumbs
              breadcrumbs={[
                {
                  text: "CRM",
                  href: "/dashboards/crm",
                },
                {
                  text: "Дуудлагууд",
                  href: "/dashboards/crm/call",
                },
                {
                  text: "Дэлгэрэнгүй",
                },
              ]}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiFlexGrid columns={3}>
          <EuiFlexItem>
            <EuiSplitPanel.Outer>
              <EuiSplitPanel.Inner color="subdued" paddingSize="m">
                Дуудлагын мэдээлэл
              </EuiSplitPanel.Inner>
              <EuiPanel hasShadow={false}>
                <EuiDescriptionList listItems={details} type="column" columnGutterSize="m" />
              </EuiPanel>
            </EuiSplitPanel.Outer>

            <EuiSpacer />

            <EuiSplitPanel.Outer>
              <EuiSplitPanel.Inner color="subdued" paddingSize="m">
                Холбогдсон түүх
              </EuiSplitPanel.Inner>
              <EuiPanel hasShadow={false}>
                {!callHistory && (
                  <EuiEmptyPrompt
                    iconType="logoSolution"
                    title={<h2>Your title</h2>}
                    body={<p>Content</p>}
                  />
                )}
                {callHistory && (
                  <EuiBasicTable
                    items={callHistory.results}
                    columns={columns}
                    tableLayout="auto"
                    pagination={{
                      ...pagination,
                      totalItemCount: callHistory?.total_count || 0,
                      showPerPageOptions: false,
                    }}
                    onChange={onTableChange}
                  />
                )}
              </EuiPanel>
            </EuiSplitPanel.Outer>
          </EuiFlexItem>
        </EuiFlexGrid>
      </>
    </DashboardCRMLayout>
  );
};

export default CallDetailsPage;
