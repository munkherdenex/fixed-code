import {
  Criteria,
  EuiAvatar,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiFieldSearch,
  EuiFlexGroup,
    EuiI18n,
  EuiProvider,
  EuiContext,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiSkeletonRectangle,
  EuiText,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useLayoutEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetSegmentAudienceList, {
  SegmentAudience,
  SegmentAudienceResponse,
} from "../../hooks/useGetSegmentAudienceList";
import useRerunSegmentAudience from "../../hooks/useRerunSegmentAudience";
import { useSegmentContext } from "../../store/segment_store";
import { isNumber } from "../../utils/helper";
import { addToast } from "../toast";
import CreateAudienceSegment from "./add_segments_audience";
import DeleteSegmentAudience from "./delete_segment_audience";
import { css } from "@emotion/react";


const titleStyle = css`
  .euiTablePagination__PerPage {
    font-size: 0; 
  }

  .euiTablePagination__PerPage::before {
    content: "Хуудсанд харуулж буй мөрний тоо";
    font-size: 14px; 
  }
`;

const schema = yup.object({
  search: yup.string().notRequired(),
});

const pathPrefix = process.env.PATH_PREFIX;

const SegmentAudienceList = () => {
  const router = useRouter();
  const { id } = router.query;
  const translate = useTranslations();

  const { data: segmentData, isLoading: segmentIsLoading } = useSegmentContext();

  const querySearch = router.query.search?.toString() || "";
  const queryPageIndex = isNumber(router.query.pageIndex) ? +router.query.pageIndex : 1;
  const queryPageSize = isNumber(router.query.pageSize) ? +router.query.pageSize : PAGINATION_CHOOSES[0];

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  // Explicitly track the relevant query parameters
  const relevantQueryParams = useMemo(() => {
    return {
      search: router.query.search?.toString() || "",
      pageIndex: isNumber(router.query.pageIndex) ? +router.query.pageIndex : 1,
      pageSize: isNumber(router.query.pageSize) ? +router.query.pageSize : PAGINATION_CHOOSES[0],
    };
  }, [router.query.search, router.query.pageIndex, router.query.pageSize]);

  const apiParams = useMemo(() => ({
    search: relevantQueryParams.search,
    limit: `${relevantQueryParams.pageSize}`,
    offset: `${relevantQueryParams.pageIndex}`,
  }), [relevantQueryParams]);

  const pagination = useMemo(
    () => ({
      pageIndex: pageIndex - 1,
      pageSize,
      pageSizeOptions: PAGINATION_CHOOSES,
    }),
    [pageIndex, pageSize],
  );

  const { data, isLoading, mutate } = useGetSegmentAudienceList<SegmentAudienceResponse>(id, apiParams);
  const { trigger, isMutating } = useRerunSegmentAudience(id);

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onTableChange = ({ page }: Criteria<SegmentAudience>) => {
    if (page) {
      const { index, size } = page;
      const newPageIndex = index + 1;
      router.push({
        query: { ...router.query, pageIndex: newPageIndex, pageSize: size, search: searchValue },
      });
    }
  };

  const columns: Array<EuiBasicTableColumn<SegmentAudience>> = [
    {
      name: translate("profile"),
      render: (segmentAudience: SegmentAudience) => (
        <>
          <EuiLink
            onClick={() => {
              router.push(`${pathPrefix}/dashboards/cdp/audience/info/${segmentAudience?.id}`);
            }}
          >
            <EuiFlexGroup direction="row" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiAvatar
                  size="m"
                  name={
                    segmentAudience?.email || segmentAudience?.phone || segmentAudience?.rid || ""
                  }
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <strong>
                    {segmentAudience?.email || segmentAudience?.phone || segmentAudience?.rid}
                  </strong>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiLink>
        </>
      ),
    },
    {
      field: "source",
      name: translate("Source"),
      render: (source: SegmentAudience["source"]) => (
        <>
          <EuiBadge
            iconType={source === "web" ? "logoWebhook" : "apps"}
            color={source === "web" ? "hollow" : ""}
          >
            {source}
          </EuiBadge>
        </>
      ),
    },
    {
      field: "created_at",
      name: translate("created_at"),
      align: "right",
      render: (date: string) => {
        return <div style={{ textWrap: "nowrap" }}>{moment(date).format("YYYY-MM-DD LT")}</div>;
      },
    },
    {
      name: translate("actions"),
      footer: () => {
        return (
          <strong>
            {translate("total")}: {data?.total_count.toLocaleString() || 0}
          </strong>
        );
      },
      actions: [
        {
          name: "Delete",
          isPrimary: true,
          description: "Delete customer",
          render: (audience: SegmentAudience) => (
            <DeleteSegmentAudience audience_id={audience.id} />
          ),
        },
      ],
    },
  ];

  const onSearchEmailAddress = (value: string) => {
    setSearchValue(value);
    router.push({
      query: { ...router.query, search: value, pageIndex: 1 }
    });
  };

  const reRunSegmentAudience = async () => {
    try {
      const response = await trigger();
      if (response) {
        mutate();
        addToast({
          id: "re-run-segment-audience",
          color: "success",
          title: "Success",
          text: "Audience updated successfully",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    if (querySearch !== searchValue) {
      setSearchValue(querySearch);
    }
    if (queryPageIndex !== pageIndex) {
      setPageIndex(queryPageIndex);
    }
    if (queryPageSize !== pageSize) {
      setPageSize(queryPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  return (
    <>
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={true}>
          <EuiFlexGroup responsive={false} alignItems="center" justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiFormRow
                label=""
                isInvalid={!!errors.search?.message}
                error={[errors.search?.message]}
              >
                <Controller
                  control={control}
                  name="search"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <EuiFieldSearch
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      height={1}
                      onSearch={onSearchEmailAddress}
                      placeholder={translate("search_phone_email")}
                      isInvalid={!!errors.search?.message}
                    />
                  )}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup>
                {segmentData?.type === "dynamic" && (
                  <EuiFlexItem>
                    <EuiButton
                      size="m"
                      iconType="refresh"
                      disabled={isMutating}
                      onClick={reRunSegmentAudience}
                    >
                      {translate("update_audience")}
                    </EuiButton>
                  </EuiFlexItem>
                )}
                <EuiFlexItem>
                  <EuiButton
                    size="m"
                    iconType="plusInCircle"
                    onClick={() => {
                      setIsFlyoutVisible(true);
                    }}
                  >
                    {translate("add_audience")}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSkeletonRectangle isLoading={isLoading || segmentIsLoading} width="100%" height={300}>
            <EuiContext
              i18n={{
                mapping: {
                  'euiTablePagination.rowsPerPage': 'Хуудсанд харуулж буй мөрний тоо',
                  'euiTablePagination.rowsPerPageOption': '{rowsPerPage} Мөр',
                },
              }}
            >

              <EuiProvider colorMode="light">
                <div css={titleStyle}>
                  <EuiBasicTable
                    tableLayout="auto"
                    items={data?.results || []}
                    columns={columns}
                    pagination={
                      data?.total_count > pageSize
                        ? { ...pagination, totalItemCount: data?.total_count || 0, showPerPageOptions: true }
                        : null
                    }
                    onChange={onTableChange}
                  />
                </div>
              </EuiProvider>
            </EuiContext>
          </EuiSkeletonRectangle>
        </EuiFlexItem>
      </EuiFlexGroup>
      {isFlyoutVisible && <CreateAudienceSegment setIsFlyoutVisible={setIsFlyoutVisible} />}
    </>
  );
};

export default SegmentAudienceList;
