import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiEmptyPrompt,
  EuiFieldSearch,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiImage,
  EuiSelect,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetTemplates, { Template, TemplateResponse } from "../../hooks/useGetTemplates";
import { badgeColor } from "../../utils/badge_color";
import { getDataKind } from "../../utils/helper";
import CreateCampaignActionPopover from "./create_campaign_action_popover";

const schema = yup.object({
  search: yup.string().notRequired().label("Search"),
  filter: yup.string().notRequired().label("Filter"),
});

const options = [
  { value: "", text: "All" },
  { value: "DRAFT", text: "DRAFT" },
  { value: "APPROVED", text: "APPROVED" },
  { value: "DONE", text: "DONE" },
  { value: "SENDING", text: "SENDING" },
  { value: "SENT", text: "SENT" },
  { value: "ERROR", text: "ERROR" },
];

const SendsTable = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const {
    control,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      search: "",
      filter: "",
    },
  });

  const { data, isLoading, mutate } = useGetTemplates<TemplateResponse>(undefined, {
    query: searchValue,
    offset: `${pageIndex * pageSize}`,
    limit: `${pageSize}`,
    filter: watch("filter"),
  });

  const columns: Array<EuiBasicTableColumn<Template>> = [
    {
      field: "title",
      name: "Title",
      "data-test-subj": "titleCell",
    },
    {
      name: "Kind",
      "data-test-subj": "kindCell",
      render: (template: Template) => {
        //INFO: This is a workaround to get the kind of the template becaouse of POCKET
        const dataKind = getDataKind(template);

        return <span>{dataKind}</span>;
      },
    },
    {
      name: "Status",
      render: (template: Template) => {
        const { status } = template;
        return (
          <span>
            <EuiBadge color={badgeColor(status)}>{status}</EuiBadge>
          </span>
        );
      },
    },
    {
      field: "created_at",
      name: "Created at",
      "data-test-subj": "createdAtCell",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
    },
    {
      field: "created_by",
      name: "Created by",
      "data-test-subj": "createdByCell",
      footer: () => {
        return <strong>Total: {data?.total_count || 0}</strong>;
      },
    },
  ];

  const onSearch = (value: string) => {
    setSearchValue(value);
  };

  const onTableChange = ({ page }: Criteria<Template>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };

  const getRowProps = (template: Template) => {
    const { id } = template;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/campaign/info/${id}`),
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.results?.length === 0 && searchValue === "" && watch("filter") === "") {
    return (
      <EuiEmptyPrompt
        icon={<EuiImage size="s" src="/images/home/empty.png" alt="" />}
        title={<h2>Create your campaign</h2>}
        layout="horizontal"
        color="plain"
        body={
          <>
            <p>The campaign description</p>
          </>
        }
        actions={<CreateCampaignActionPopover />}
      />
    );
  }

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiFlexGrid columns={2}>
              <EuiFlexItem grow={false}>
                <EuiFormRow
                  label="Search"
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
                        onSearch={onSearch}
                        placeholder="Search Campaign"
                        isInvalid={!!errors.search?.message}
                      />
                    )}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormRow
                  label="Filter"
                  isInvalid={!!errors.search?.message}
                  error={[errors.search?.message]}
                >
                  <Controller
                    control={control}
                    name="filter"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <EuiSelect
                        onBlur={onBlur}
                        options={options}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGrid>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              display="base"
              iconType="refresh"
              size="s"
              isLoading={isLoading}
              onClick={() => mutate()}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <EuiBasicTable
            tableCaption="Campaign table"
            items={data?.results || []}
            columns={columns}
            rowProps={getRowProps}
            cellProps={getCellProps}
            pagination={
              data?.total_count > pageSize
                ? {
                    ...pagination,
                    totalItemCount: data?.total_count || 0,
                    showPerPageOptions: true,
                  }
                : {
                    totalItemCount: 0,
                    pageSize: 0,
                    pageIndex: 0,
                  }
            }
            onChange={onTableChange}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SendsTable;
