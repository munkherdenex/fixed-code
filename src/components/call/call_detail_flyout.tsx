import {
  useGeneratedHtmlId,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiBadge,
  EuiConfirmModal,
  EuiFieldNumber,
  EuiFieldText,
} from "@elastic/eui";
import { SetStateAction, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addToast } from "../toast";
import useAssignCustomer from "../../hooks/useAssignCustomer";
import { useTranslations } from "next-intl";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";
import { PAGINATION_CHOOSES } from "../../constants";
import { KeyedMutator } from "swr";
import contactLogApi from "../../api/contact_log";

interface CallDetails {
  id: number;
  customer_id: number | null;
  type: string;
  body: string;
  source: string;
  phone: string;
  team_id: number | null;
  status: string;
  call_id: string;
  call_date: string;
  call_agent: string;
  call_duration: number | null;
  call_record_url: string | null;
  call_type: string;
  call_state: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

interface CallDetailFlyoutProps {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
  selectedCall: CallDetails;
  mutate: KeyedMutator<any>;
}

const ticketSchema = yup
  .object({
    tt_id: yup.number().required(),
    cl_id: yup.number().required(),
    at_email: yup.string().required(),
  })
  .required();

type FormData = yup.InferType<typeof ticketSchema>;

const schema = yup
  .object({
    customer: yup
      .array()
      .of(
        yup
          .object({
            label: yup.string().notRequired(),
            value: yup.string().required("please enter audience"),
          })
          .required("please enter audience"),
      )
      .required("please enter audience"),
  })
  .required();

type AudienceFormData = yup.InferType<typeof schema>;

const CallDetailFlyout = ({ setIsFlyoutVisible, selectedCall, mutate }: CallDetailFlyoutProps) => {
  const translate = useTranslations();
  const flyoutHeadingId = useGeneratedHtmlId();

  const modalTitleId = useGeneratedHtmlId();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chosenActionType, setChosenActionType] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const { data: segmentCustomers, isLoading } = useGetCustomers<CustomersResponse>(null, {
    limit: `${PAGINATION_CHOOSES[3]}`,
  });

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const openConfirm = (type: string) => {
    setChosenActionType(type);
    setIsModalVisible(true);
  };

  const ticketForm = useForm<FormData>({
    resolver: yupResolver(ticketSchema),
    defaultValues: {
      tt_id: undefined,
      cl_id: selectedCall.id,
      at_email: undefined,
    },
  });

  const audienceForm = useForm<AudienceFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      customer: [],
    },
  });

  useEffect(() => {
    if (!isLoading && segmentCustomers) {
      const at_email = segmentCustomers.results.find(
        (el) => el.id === selectedCall.customer_id,
      )?.email;

      ticketForm.reset({
        tt_id: undefined,
        cl_id: selectedCall.id,
        at_email,
      });
    }
  }, [isLoading, segmentCustomers, selectedCall.customer_id, ticketForm]);

  const { trigger } = useAssignCustomer(selectedCall.id);

  const createTicket = ticketForm.handleSubmit(async (data: FormData) => {
    try {
      console.log(data);
      const response = await contactLogApi.createTicket(data);
      if (response) {
        setIsFlyoutVisible(false);
        addToast({
          id: "assign-customer-success",
          color: "success",
          title: "Success",
          text: "Ticket created successfully:",
        });
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      addToast({
        id: "segment-audience-error",
        color: "danger",
        title: "Error",
        text: "Failed to create a ticket.",
      });
    }
  });

  const assignCustomer = audienceForm.handleSubmit(async (data: AudienceFormData) => {
    try {
      if (data?.customer[0]?.value) {
        const prepareData = {
          customer_id: Number(data.customer[0].value),
        };
        const response = await trigger(prepareData);
        if (response) {
          setIsFlyoutVisible(false);
          addToast({
            id: "assign-customer-success",
            color: "success",
            title: "Success",
            text: "Assigned a customer successfully.",
          });
          mutate();
        }
      }
    } catch (e) {
      console.error(e);
      addToast({
        id: "segment-audience-error",
        color: "danger",
        title: "Error",
        text: "Failed to assign customer to contact log.",
      });
    }
  });

  const dataTypeOptions: EuiComboBoxOptionOption[] =
    segmentCustomers?.results?.map((customer) => {
      return {
        label: customer?.email || customer?.phone || customer?.rid,
        "aria-label": `${customer?.email} ${customer?.phone} ${customer?.rid}`,
        value: String(customer?.id),
        append: <EuiBadge>{customer?.phone || customer?.email || customer?.rid}</EuiBadge>,
      };
    }) || [];

  const isConfirmButtonDisabled = () => {
    if (chosenActionType == "assign") {
      return selectedOptions.length === 0;
    }
  };

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      {isModalVisible && (
        <EuiConfirmModal
          aria-labelledby={modalTitleId}
          style={{ width: 600 }}
          title={
            chosenActionType == "ticket" ? "Create a ticket?" : "Assign customer to contact log?"
          }
          titleProps={{ id: modalTitleId }}
          onCancel={closeModal}
          onConfirm={chosenActionType == "ticket" ? createTicket : assignCustomer}
          cancelButtonText="Cancel"
          confirmButtonText="Confirm"
          confirmButtonDisabled={isConfirmButtonDisabled()}
          defaultFocusedButton="confirm"
        >
          {chosenActionType == "ticket" ? (
            <EuiForm component="form">
              <EuiFormRow
                label="Ticket Template"
                isInvalid={!!ticketForm.formState.errors.tt_id}
                error={ticketForm.formState.errors.tt_id?.message}
              >
                <Controller
                  name="tt_id"
                  control={ticketForm.control}
                  render={({ field }) => (
                    <EuiFieldNumber
                      {...field}
                      placeholder="Enter ticket template"
                      isInvalid={!!ticketForm.formState.errors.tt_id}
                    />
                  )}
                />
              </EuiFormRow>

              <EuiFormRow
                label="Contact Log"
                isInvalid={!!ticketForm.formState.errors.cl_id}
                error={ticketForm.formState.errors.cl_id?.message}
              >
                <Controller
                  name="cl_id"
                  control={ticketForm.control}
                  render={({ field }) => (
                    <EuiFieldNumber
                      {...field}
                      placeholder="Enter contact log"
                      isInvalid={!!ticketForm.formState.errors.cl_id}
                      disabled
                    />
                  )}
                />
              </EuiFormRow>

              <EuiFormRow
                label="Assigned To"
                isInvalid={!!ticketForm.formState.errors.at_email}
                error={ticketForm.formState.errors.at_email?.message}
              >
                <Controller
                  name="at_email"
                  control={ticketForm.control}
                  render={({ field }) => (
                    <EuiFieldText
                      {...field}
                      placeholder="Enter assigned to"
                      isInvalid={!!ticketForm.formState.errors.at_email}
                      disabled
                    />
                  )}
                />
              </EuiFormRow>
            </EuiForm>
          ) : (
            <EuiForm component="form">
              <EuiFormRow
                label={translate("search_email_address_phone_rid")}
                isInvalid={
                  !!audienceForm.formState.errors.customer?.message ||
                  !!audienceForm.formState.errors.customer?.[0]?.value?.message
                }
                error={[
                  audienceForm.formState.errors.customer?.message ||
                    audienceForm.formState.errors.customer?.[0]?.value?.message,
                ]}
              >
                <Controller
                  control={audienceForm.control}
                  name="customer"
                  render={({ field: { value, onBlur, onChange } }) => (
                    <EuiComboBox
                      placeholder="Search"
                      singleSelection={{ asPlainText: true }}
                      options={dataTypeOptions}
                      onChange={(selected) => {
                        setSelectedOptions(selected);
                        onChange(selected);
                      }}
                      selectedOptions={[{ label: (value && value[0]?.label) || "" }]}
                      onBlur={onBlur}
                      isClearable={false}
                      isLoading={isLoading}
                    />
                  )}
                />
              </EuiFormRow>
            </EuiForm>
          )}
        </EuiConfirmModal>
      )}
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>Call Detail</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiFlexGroup gutterSize="l" direction="row" wrap>
          {/* Column 1 */}
          <EuiFlexItem>
            <EuiDescriptionList>
              <EuiDescriptionListTitle>ID</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>{selectedCall.id}</EuiDescriptionListDescription>

              <EuiDescriptionListTitle>Phone</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>{selectedCall.phone}</EuiDescriptionListDescription>

              <EuiDescriptionListTitle>Call Date</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {selectedCall.call_date}
              </EuiDescriptionListDescription>

              <EuiDescriptionListTitle>Call Agent</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {selectedCall.call_agent}
              </EuiDescriptionListDescription>

              <EuiDescriptionListTitle>Call Duration</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {selectedCall.call_duration ?? "N/A"}
              </EuiDescriptionListDescription>
            </EuiDescriptionList>
          </EuiFlexItem>

          {/* Column 2 */}
          <EuiFlexItem>
            <EuiDescriptionList>
              <EuiDescriptionListTitle>Call Type</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {selectedCall.call_type}
              </EuiDescriptionListDescription>

              <EuiDescriptionListTitle>Call State</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {selectedCall.call_state}
              </EuiDescriptionListDescription>

              <EuiDescriptionListTitle>Status</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>{selectedCall.status}</EuiDescriptionListDescription>

              <EuiDescriptionListTitle>Source</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>{selectedCall.source}</EuiDescriptionListDescription>

              <EuiDescriptionListTitle>Created At</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {selectedCall.created_at}
              </EuiDescriptionListDescription>

              <EuiDescriptionListTitle>Updated At</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {selectedCall.updated_at}
              </EuiDescriptionListDescription>
            </EuiDescriptionList>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiFlexGroup justifyContent="flexStart" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiButton onClick={() => openConfirm("ticket")}>Create a Ticket</EuiButton>
          </EuiFlexItem>
          {!selectedCall.customer_id && (
            <EuiFlexItem grow={false}>
              <EuiButton onClick={() => openConfirm("assign")}>Assign Customer</EuiButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CallDetailFlyout;
