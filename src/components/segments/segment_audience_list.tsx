import {
  Criteria,
  EuiAvatar,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiFieldSearch,
  EuiFlexGroup,
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
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetSegmentAudienceList, {
  SegmentAudience,
  SegmentAudienceResponse,
} from "../../hooks/useGetSegmentAudienceList";
import useRerunSegmentAudience from "../../hooks/useRerunSegmentAudience";
import { useSegmentContext } from "../../store/segment_store";
import { addToast } from "../toast";
import CreateAudienceSegment from "./add_segments_audience";
import DeleteSegmentAudience from "./delete_segment_audience";

const schema = yup.object({
  search: yup.string().notRequired(),
});

const pathPrefix = process.env.PATH_PREFIX;

const SegmentAudienceList = () => {
  const router = useRouter();
  const { id } = router.query;
  const translate = useTranslations();

  const { data: segmentData, isLoading: segmentIsLoading } = useSegmentContext();

  const [searchValue, setSearchValue] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const { data, isLoading, mutate } = useGetSegmentAudienceList<SegmentAudienceResponse>(id, {
    search: searchValue,
    offset: `${pageIndex}`,
    limit: `${pageSize}`,
  });
  const { trigger, isMutating } = useRerunSegmentAudience(id);

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onTableChange = ({ page }: Criteria<SegmentAudience>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
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
            {translate("total")}: {data?.total_count || 0}
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
            <EuiBasicTable
              tableLayout="auto"
              items={data?.results || []}
              columns={columns}
              pagination={{
                ...pagination,
                totalItemCount: data?.total_count || 0,
              }}
              onChange={onTableChange}
            />
          </EuiSkeletonRectangle>
        </EuiFlexItem>
      </EuiFlexGroup>
      {isFlyoutVisible && <CreateAudienceSegment setIsFlyoutVisible={setIsFlyoutVisible} />}
    </>
  );
};

export default SegmentAudienceList;
