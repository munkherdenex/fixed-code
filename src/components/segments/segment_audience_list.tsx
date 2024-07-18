import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
} from "@elastic/eui";
import { useRouter } from "next/router";
import useGetSegmentAudienceList, {
  SegmentAudience,
  SegmentAudienceResponse,
} from "../../hooks/useGetSegmentAudienceList";
import { useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";
import { PAGINATION_CHOOSES } from "../../constants";
import CreateAudienceSegment from "./add_segments_audience";
import DeleteSegmentAudience from "./delete_segment_audience";

const schema = yup.object({
  search: yup.string().notRequired(),
});

const SegmentAudienceList = () => {
  const router = useRouter();
  const { id } = router.query;
  const [searchValue, setSearchValue] = useState("");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };
  const { data, isLoading } = useGetSegmentAudienceList<SegmentAudienceResponse>(id, {
    search: searchValue,
    offset: `${pageIndex * pageSize}`,
    limit: `${pageSize}`,
  });

  const {
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
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
      field: "email",
      name: "Email address",
    },
    {
      field: "phone",
      name: "Phone number",
    },
    {
      field: "source",
      name: "Source",
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
      name: "Created at",
      mobileOptions: {
        render: (customer: SegmentAudience) =>
          moment(customer.created_at).format("YYYY-MM-DD hh:mm:ss"),
        enlarge: true,
      },
    },
    {
      name: "Action",
      field: "",
      footer: () => {
        return <strong>Total: {data?.total_count || 0}</strong>;
      },
      render: (audience: SegmentAudience) => <DeleteSegmentAudience audience_id={audience.id} />,
    },
  ];

  const onSearchEmailAddress = (value: string) => {
    setSearchValue(value);
  };

  if (isLoading) return <div>loading...</div>;

  if (!data) return <div>empty</div>;

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
                      placeholder="Search email or phone"
                      isInvalid={!!errors.search?.message}
                    />
                  )}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                size="m"
                iconType="plusInCircle"
                onClick={() => {
                  setIsFlyoutVisible(true);
                }}
              >
                Add audience
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiSpacer size="s" />

        <EuiFlexItem>
          <EuiBasicTable
            items={data?.results || []}
            columns={columns}
            pagination={{
              ...pagination,
              totalItemCount: data?.total_count || 0,
            }}
            onChange={onTableChange}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      {isFlyoutVisible && <CreateAudienceSegment setIsFlyoutVisible={setIsFlyoutVisible} />}
    </>
  );
};

export default SegmentAudienceList;
