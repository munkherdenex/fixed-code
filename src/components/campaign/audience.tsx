import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiCheckbox,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSkeletonRectangle,
  EuiSwitch,
  EuiTableFieldDataColumnType,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useDeleteTemplateCustomer from "../../hooks/useDeleteTemplateCustomer";
import useGetTemplatesCustomer, {
  TemplateCustomer,
  TemplateCustomerResponse,
} from "../../hooks/useGetTemplatesCustomer";
import { useCampaignContext } from "../../store/campaign_store";
import { globalMutate } from "../../utils/globalMutate";
import AddAudience from "./add_audience";

const Audience = () => {
  const router = useRouter();
  const translate = useTranslations();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<TemplateCustomer>();

  const modalTitleId = useGeneratedHtmlId({ prefix: "modalTitle" });

  const { data: template, toggleIsToAll } = useCampaignContext();
  const { data: templateCustomers, isLoading } = useGetTemplatesCustomer<TemplateCustomerResponse>(
    router.query.id,
    {
      limit: `${pageSize}`,
      offset: `${pageIndex * pageSize}`,
    },
  );
  const { trigger, isMutating } = useDeleteTemplateCustomer(router.query.id);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const actionEnabled = template?.status === "DRAFT";

  const columns: Array<EuiBasicTableColumn<TemplateCustomer>> = [
    {
      name: translate("name"),
      "data-test-subj": "nameCell",
      render: (templateCustomer: TemplateCustomer) => {
        return templateCustomer?.name;
      },
    },
    {
      name: translate("type"),
      field: "type",
      "data-test-subj": "typeCell",
    },
  ];

  const actions: Array<EuiBasicTableColumn<TemplateCustomer>> = useMemo(() => {
    if (actionEnabled)
      return [
        {
          name: "Actions",
          actions: [
            {
              name: "Delete",
              isPrimary: true,
              icon: "trash",
              color: "danger",
              type: "icon",
              description: "Delete customer",
              onClick: (templateCustomer: TemplateCustomer) => {
                setSelectedAudience(templateCustomer);
                showModal();
              },
            },
            {
              name: "View",
              icon: "arrowRight",
              color: "primary",
              type: "icon",
              description: "view customer",
              onClick: (templateCustomer: TemplateCustomer) => {
                const { object_id, type } = templateCustomer;
                const type_path = type === "customer" ? "audience" : "segments";
                router.push(`/dashboards/cdp/${type_path}/info/${object_id}`);
              },
            },
          ],
        },
      ];

    return [
      {
        name: "Actions",
        actions: [
          {
            name: "View",
            icon: "arrowRight",
            color: "primary",
            type: "icon",
            description: "view customer",
            onClick: (templateCustomer: TemplateCustomer) => {
              const { object_id, type } = templateCustomer;
              const type_path = type === "customer" ? "audience" : "segments";
              router.push(`/dashboards/cdp/${type_path}/info/${object_id}`);
            },
          },
        ],
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionEnabled]);

  const onTableChange = ({ page }: Criteria<TemplateCustomer>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };

  const getCellProps = (
    template: TemplateCustomer,
    column: EuiTableFieldDataColumnType<TemplateCustomer>,
  ) => {
    const { object_id } = template;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${object_id}-${String(field)}`,
      textOnly: true,
    };
  };

  const handleDeleteModalConfirm = async () => {
    try {
      await trigger({
        type: selectedAudience.type,
        id: selectedAudience?.object_id,
      });
    } catch (error) {
      console.error(error);
    }
    globalMutate(`/api/v1/dj/templates/${router.query.id}/customers/`);
    closeModal();
  };

  return (
    <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={390}>
      <EuiFlexGroup direction="column">
        <EuiFormRow
          fullWidth
          helpText={translate("help__to_all_customers")}
        >
          <EuiSwitch
            id="isToAllCustomers11"
            checked={template.is_to_all}
            onChange={toggleIsToAll}
            label={translate("to_all_customers")}
            disabled={!actionEnabled}
          />
        </EuiFormRow>
        {!template.is_to_all && actionEnabled && (
          <EuiFlexItem>
            <AddAudience />
          </EuiFlexItem>
        )}
        {!template.is_to_all && (
          <EuiFlexItem>
            <EuiBasicTable
              tableCaption="Template customers"
              items={templateCustomers?.results || []}
              columns={[...columns, ...actions]}
              cellProps={getCellProps}
              pagination={
                templateCustomers?.total_count > pageSize
                  ? {
                      ...pagination,
                      totalItemCount: templateCustomers?.total_count || 0,
                    }
                  : {
                      totalItemCount: 0,
                      pageSize: 0,
                      pageIndex: 0,
                    }
              }
              onChange={onTableChange}
            />
          </EuiFlexItem>
        )}
        {isModalVisible && (
          <EuiConfirmModal
            aria-labelledby={modalTitleId}
            title="Delete templates customer"
            isLoading={isMutating}
            onCancel={closeModal}
            onConfirm={handleDeleteModalConfirm}
            cancelButtonText="Cancel"
            confirmButtonText="Delete"
            defaultFocusedButton="confirm"
            buttonColor="danger"
          >
            <p></p>
          </EuiConfirmModal>
        )}
      </EuiFlexGroup>
    </EuiSkeletonRectangle>
  );
};

export default Audience;
