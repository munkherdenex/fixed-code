import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiBreadcrumbs,
  EuiButton,
  EuiButtonIcon,
  EuiDescriptionList,
  EuiEmptyPrompt,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiSpacer,
  EuiSplitPanel,
  EuiText,
  EuiTextArea,
} from "@elastic/eui";
import contactLogApi from "@/api/contact_log";
import { addToast } from "@/components/toast";
import DashboardCRMLayout from "@/layouts/dashboard_crm";
import { callTypeOptions } from "@/components/call/table";
import { css } from "@emotion/react";
import useSWR from "swr";
import moment from "moment";
import { PAGINATION_CHOOSES } from "@/constants";
import { formatDate } from "@/utils/helper";
import { CallStateBadge } from "@/components/call/call_state_badge";
import CustomerPanel from "@/components/customer/customer_panel";
import TicketCreatePanel from "@/components/ticket/ticket_create_panel";
import ticketApi from "@/api/ticket";

const CallDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Use Next.js useSearchParams hook
  const { id } = useParams(); // Get the `call_id` parameter from the URL

  const {
    data: callDetails,
    isLoading,
    mutate: mutateCallDetail,
  } = useSWR(`/crm/calls/${id}`, () => contactLogApi.getCallByCallId(id));

  const [noteBody, setNoteBody] = useState(callDetails?.body || "");

  useEffect(() => {
    if (callDetails?.body !== undefined) {
      setNoteBody(callDetails.body);
    }
  }, [callDetails]);

  const queryState = useMemo(
    () => ({
      search: callDetails ? callDetails.phone : "",
      filter: searchParams.get("filter") || "",
      callState: searchParams.get("callState") || "",
      callType: searchParams.get("callType") || "",
      date: searchParams.get("date") ? moment(searchParams.get("date")) : null,
      offset: parseInt(searchParams.get("offset") || "1", 10),
      limit: parseInt(searchParams.get("limit") || PAGINATION_CHOOSES[0].toString(), 10),
    }),
    [callDetails, searchParams],
  );

  const pagination = useMemo(
    () => ({
      pageIndex: queryState.offset,
      pageSize: queryState.limit,
      pageSizeOptions: PAGINATION_CHOOSES,
    }),
    [queryState.offset, queryState.limit],
  );

  const { data: callHistory, isLoading: isLoadingHistory } = useSWR(
    queryState.search ? ["/crm/calls/", queryState] : null,
    () => (queryState.search ? contactLogApi.getCalls(queryState) : null),
  );

  const { data: contactLogTickets, isLoading: isLoadingTickets } = useSWR(
    callDetails ? ["/crm/ticket/", callDetails.id] : null,
    () => (callDetails ? ticketApi.getTickets({ cl_id: callDetails.id }) : null),
  );

  const updateBody = useCallback(async () => {
    try {
      console.debug(">> ", callDetails.id, noteBody);
      const updatedData = await contactLogApi.updateContactLogById(callDetails.id, noteBody);
      mutateCallDetail((prev) => ({ ...prev, body: noteBody }), false);
      return updatedData;
    } catch (error) {
      console.error("Failed to update note:", error);
      throw error;
    }
  }, [callDetails, noteBody, mutateCallDetail]);

  const onTableChange = ({ page }: Criteria<any>) => {
    if (page) {
      const updatedParams = new URLSearchParams(searchParams.toString());
      updatedParams.set("offset", page.index.toString());
      updatedParams.set("limit", page.size.toString());
      router.replace(`/dashboards/crm/call/${id}?${updatedParams.toString()}`);
    }
  };

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
    {
      title: "Дуудлагын төлөв",
      description: <CallStateBadge callState={callDetails.call_state} />,
    },
    { title: "Дуудлагын төрөл", description: callDetails.call_type },
    { title: "Дуудлага авсан ажилтан", description: callDetails.call_agent || "-" },
    { title: "Залгасан огноо", description: callDetails.call_date },
    { title: "Үргэлжлэх хугацаа", description: `${callDetails.call_duration || 0} секунд` },
    {
      title: "Дуудлагын бичлэг",
      description: callDetails.call_record_url ? (
        <audio controls>
          <source src={callDetails.call_record_url} type="audio/mpeg" />
          Таны хөтөч аудио тоглуулахыг дэмжихгүй байна.
        </audio>
      ) : (
        "Бичлэг байхгүй"
      ),
    },
  ];

  const columns: Array<EuiBasicTableColumn<any>> = [
    {
      field: "call_date",
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
          {formatDate(phone)}
        </span>
      ),
    },
    {
      field: "call_duration",
      name: "Үргэлжлэх хугацаа",
      render: (duration: number) => `${duration || 0} секунд`,
    },
    // {
    //   field: "call_state",
    //   name: "Төлөв",
    //   render: (state: string) => <CallStateBadge callState={state} />,
    // },
    {
      name: "Үйлдэл",
      render: (item: any) => (
        <EuiButtonIcon
          iconType="eye"
          aria-label="Харах"
          onClick={() => router.push(`/dashboards/crm/call/${item.call_id}`)}
        />
      ),
    },
  ];

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
              <EuiPanel hasShadow={false} borderRadius="none">
                <EuiDescriptionList listItems={details} type="column" columnGutterSize="m" />
              </EuiPanel>
            </EuiSplitPanel.Outer>

            <EuiSpacer />

            <EuiSplitPanel.Outer hasShadow={false} hasBorder>
              <EuiSplitPanel.Inner color="subdued" paddingSize="m">
                Холбогдсон түүх
              </EuiSplitPanel.Inner>
              <EuiPanel hasShadow={false}>
                <EuiSkeletonRectangle
                  isLoading={isLoadingHistory}
                  contentAriaLabel="Demo skeleton card"
                  width={500}
                  height={300}
                  borderRadius="m"
                >
                  {!callHistory && (
                    <EuiEmptyPrompt
                      iconType="logoSolution"
                      title={<h2>Холбогдсон түүх байхгүй</h2>}
                      body={<p>Энэ дуудлагын холбогдсон түүх олдсонгүй.</p>}
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
                </EuiSkeletonRectangle>
              </EuiPanel>
            </EuiSplitPanel.Outer>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSplitPanel.Outer hasShadow={false} hasBorder>
              <EuiSplitPanel.Inner color="subdued">Тэмдэглэл</EuiSplitPanel.Inner>
              <EuiPanel paddingSize="s">
                <EuiFlexGroup direction="column" gutterSize="xs">
                  <EuiFlexItem>
                    <EuiTextArea
                      fullWidth
                      rows={3}
                      placeholder="Ярилцсан агуулгыг оруулна уу"
                      value={noteBody}
                      onChange={(e) => {
                        setNoteBody(e.target.value);
                      }}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiButton
                      iconType="save"
                      aria-label="Хадгалах"
                      disabled={isLoading}
                      onClick={async () => {
                        try {
                          updateBody();

                          addToast({
                            id: "success",
                            title: "Амжилттай хадгаллаа",
                            color: "success",
                          });
                        } catch (error) {
                          addToast({
                            id: "error",
                            title: "Алдаа гарлаа",
                            color: "danger",
                          });
                          console.error("Failed to update note:", error);
                        }
                      }}
                    >
                      Хадгалах
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPanel>
            </EuiSplitPanel.Outer>
          </EuiFlexItem>
          <EuiFlexItem>
            <CustomerPanel customerId={callDetails.customer_id ? callDetails.customer_id : null} phone={callDetails.phone} />
            <EuiSpacer size="m" />
            <EuiSkeletonRectangle isLoading={isLoadingTickets} height={200} width={500}>
              {contactLogTickets && contactLogTickets?.total_count > 0 && (
                <EuiSplitPanel.Outer hasShadow={false} hasBorder>
                  <EuiSplitPanel.Inner color="subdued" paddingSize="m">
                    <EuiFlexGroup alignItems="center">
                      <EuiFlexItem>Тикетийн мэдээлэл</EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          size="s"
                          href={`/dashboards/crm/ticket/${contactLogTickets.results[0]?.id}`}
                          target="_blank"
                        >
                          Тикет руу очих
                        </EuiButton>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiSplitPanel.Inner>
                  <EuiPanel>
                    <EuiDescriptionList
                      listItems={[
                        {
                          title: "Төрөл",
                          description: contactLogTickets.results[0]?.category || "-",
                        },
                        {
                          title: "Гарчиг",
                          description: contactLogTickets.results[0]?.title || "-",
                        },
                        {
                          title: "Агуулга",
                          description: contactLogTickets.results[0]?.body || "-",
                        },
                        {
                          title: "Төлөв",
                          description: contactLogTickets.results[0]?.status || "-",
                        },
                      ]}
                    />
                  </EuiPanel>
                </EuiSplitPanel.Outer>
              )}
              {(!contactLogTickets || contactLogTickets?.total_count == 0) && (
                <TicketCreatePanel ticketId={callDetails.ticketId} contactLog={callDetails} />
              )}
            </EuiSkeletonRectangle>
          </EuiFlexItem>
        </EuiFlexGrid>
      </>
    </DashboardCRMLayout>
  );
};

export default CallDetailsPage;
