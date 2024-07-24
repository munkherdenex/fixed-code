import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTableFieldDataColumnType,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useDeleteTemplateCustomer from "../../hooks/useDeleteTemplateCustomer";
import useGetTemplates, { Template } from "../../hooks/useGetTemplates";
import useGetTemplatesCustomer, {
  TemplateCustomer,
  TemplateCustomerResponse,
} from "../../hooks/useGetTemplatesCustomer";
import { globalMutate } from "../../utils/globalMutate";
import AddAudienceFlyout from "./add_audience_flyot";

const Audience = () => {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isAddAudienceFlyoutVisible, setIsAddAudienceFlyoutVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<TemplateCustomer>();

  const modalTitleId = useGeneratedHtmlId({ prefix: "modalTitle" });

  const { data: template } = useGetTemplates<Template>(router.query.id);
  const { data: templateCustomers } = useGetTemplatesCustomer<TemplateCustomerResponse>(
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

  const columns: Array<EuiBasicTableColumn<TemplateCustomer>> = [
    {
      field: "name",
      name: "Name",
      "data-test-subj": "nameCell",
    },
    {
      field: "type",
      name: "Type",
      "data-test-subj": "typeCell",
    },
  ];

  const actions: Array<EuiBasicTableColumn<TemplateCustomer>> = [
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
            router.push(`/dashboards/${type_path}/info/${object_id}`);
          },
        },
      ],
    },
  ];

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
    const response = await trigger({
      type: selectedAudience.type,
      id: selectedAudience?.object_id,
    });
    if (response) {
      globalMutate(`/api/v1/dj/templates/${router.query.id}/customers/`);
      closeModal();
    }
  };

  return (
    <EuiFlexGroup direction="column">
      {template?.status === "DRAFT" && (
        <EuiFlexItem grow={false}>
          <div>
            <EuiButton
              size="s"
              iconType="plusInCircle"
              onClick={() => setIsAddAudienceFlyoutVisible(true)}
            >
              Add audience
            </EuiButton>
          </div>
        </EuiFlexItem>
      )}
      <EuiFlexItem>
        <EuiBasicTable
          tableCaption="Template customers"
          items={templateCustomers?.results || []}
          columns={[...columns, ...(template?.status === "DRAFT" ? actions : [])]}
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
      {isAddAudienceFlyoutVisible && (
        <AddAudienceFlyout closeFlyout={() => setIsAddAudienceFlyoutVisible(false)} />
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
  );
};

export default Audience;
