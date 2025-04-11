import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiButtonEmpty,
  EuiEmptyPrompt,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiImage,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useLayoutEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { PAGINATION_CHOOSES } from "../../../constants";
import useGetCRMTicketTemplate, {
  CRMTicketTemplate,
  CRMTicketTemplateResponse,
} from "../../../hooks/useGetCRMTicketTemplate";
import { isNumber } from "../../../utils/helper";
import TicketTemplateEditor from "../../ticket_template/editor";
import { addToast } from "@/components/toast";
import ticketTemplateApi from "@/api/ticket_template";

const EditTemplateFlyout = ({ isOpen, closeFlyout, template, mutateTemplates }) => {
  const simpleFlyoutTitleId = useGeneratedHtmlId();
  const [templateData, setTemplateData] = useState(template);
  const [items, setItems] = useState(template?.fields || []);

  const handleSave = async () => {
    try {
      mutateTemplates((currentData) => {
        return {
          ...currentData,
          results: currentData.results.map((t) =>
            t.id === templateData.id ? { ...templateData, fields: items } : t,
          ),
        };
      }, false);
      await ticketTemplateApi.update(templateData.id, {
        name: templateData.name,
        description: templateData.description,
        has_priority: templateData.has_priority,
        is_active: templateData.is_active,
        fields: items,
      });
      addToast({
        id: "success",
        title: "Амжилттай хадгаллаа",
        color: "success",
      });

      mutateTemplates();
    } catch (e) {
      addToast({
        id: "error",
        title: "Хадгалахад алдаа гарлаа",
        text: e.message,
        color: "danger",
      });
      console.error(e);

      mutateTemplates();
    }
    closeFlyout();
  };

  return (
    isOpen && (
      <EuiFlyout
        ownFocus
        onClose={() => closeFlyout()}
        aria-labelledby={simpleFlyoutTitleId}
        size="l"
      >
        <EuiFlyoutBody>
          {template && (
            <TicketTemplateEditor
              onChange={(updatedTemplateData, updatedItems) => {
                setTemplateData(updatedTemplateData);
                setItems(updatedItems);
              }}
              initialTicketTemplate={template}
            />
          )}
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                iconType="cross"
                onClick={() => {
                  closeFlyout();
                }}
                flush="left"
              >
                Хаах
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton onClick={handleSave} fill>
                Хадгалах
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    )
  );
};

const TemplateTable = () => {
  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  const [state, setState] = useState({
    searchValue: query?.search?.toString() || "",
    filter: query?.filter?.toString() || "",
    pageIndex: isNumber(query?.pageIndex) ? +query?.pageIndex : 0,
    pageSize: isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[0],
  });

  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [chosenTemplate, setChosenTemplate] = useState(null);

  const { searchValue, filter, pageIndex, pageSize } = state;

  const { data, isLoading, mutate } = useGetCRMTicketTemplate<CRMTicketTemplateResponse>(
    undefined,
    {
      query: searchValue,
      filter,
      offset: `${pageIndex * pageSize}`,
      limit: `${pageSize}`,
    },
  );

  const updateQueryParams = (newParams) => {
    router.push({ query: { ...query, ...newParams } });
    setState((prev) => ({ ...prev, ...newParams }));
  };

  const onSearch = (value) => updateQueryParams({ search: value, pageIndex: 0 });

  const onTableChange = ({ page }: Criteria<CRMTicketTemplate>) => {
    if (page) {
      const { index: newPageIndex, size: newPageSize } = page;
      updateQueryParams({ pageIndex: newPageIndex, pageSize: newPageSize });
    }
  };

  const getRowProps = (template: CRMTicketTemplate) => ({
    "data-test-subj": `row-${template.id}`,
    className: "customRowClass",
    onClick: () => {
      setChosenTemplate(template);
      setIsFlyoutVisible(true);
    },
  });

  const getCellProps = (template: CRMTicketTemplate, column) => ({
    className: "customCellClass",
    "data-test-subj": `cell-${template.id}-${String(column.field)}`,
    textOnly: true,
  });

  useLayoutEffect(() => {
    setState({
      searchValue: query?.search?.toString() || "",
      filter: query?.filter?.toString() || "",
      pageIndex: isNumber(query?.pageIndex) ? +query?.pageIndex : 0,
      pageSize: isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[2],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (isLoading) {
    return <div>{translate("loading")}</div>;
  }

  if (data?.results?.length === 0 && !searchValue && !filter) {
    return (
      <EuiEmptyPrompt
        icon={<EuiImage size="s" src="/images/home/empty.png" alt="" />}
        title={<h2>Тикетийн загвараа үүсгээрэй</h2>}
        layout="horizontal"
        color="plain"
        body={<p>Загвар бүр өөр өөр талбартай байж болно.</p>}
      />
    );
  }

  const columns: Array<EuiBasicTableColumn<CRMTicketTemplate>> = [
    { field: "name", name: translate("name") },
    { field: "description", name: translate("description") },
    { field: "is_active", name: translate("is_active") },
    { field: "updated_at", name: translate("updated_at") },
  ];

  return (
    <>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFieldSearch
            placeholder={translate("search")}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            isClearable
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiBasicTable
            tableCaption={translate("campaign_table")}
            items={data?.results || []}
            columns={columns}
            rowProps={getRowProps}
            cellProps={getCellProps}
            pagination={
              data?.total_count > pageSize
                ? {
                    pageIndex,
                    pageSize,
                    pageSizeOptions: PAGINATION_CHOOSES,
                    totalItemCount: data?.total_count || 0,
                    showPerPageOptions: true,
                  }
                : undefined
            }
            onChange={onTableChange}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EditTemplateFlyout
        isOpen={isFlyoutVisible}
        closeFlyout={() => {
          setIsFlyoutVisible(false);
        }}
        template={chosenTemplate}
        mutateTemplates={mutate}
      />
    </>
  );
};

export default TemplateTable;
