import {
  EuiButton,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiSkeletonRectangle,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { use, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import * as yup from "yup";
import ticketTemplateApi from "../../api/ticket_template";
import getFieldComponent from "../ticket_template/utils";

const schema = yup
  .object({
    status: yup.string().required(),
    title: yup.string().required(),
    description: yup.string(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const DynamicForm = ({ ticket_template_id, ticket_template }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data); // Handle form submission
    return false;
  };

  return (
    <EuiForm component='form' onSubmit={handleSubmit(onSubmit)}>
      {ticket_template &&
        ticket_template.fields.map((item) => {
          return (
            <Controller
              key={`ctrllr__${item.id}`}
              control={control}
              name={item.attr_name}
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFormRow
                  key={item.id}
                  label={item.name}
                  helpText={item.config?.helpText}
                >
                  {getFieldComponent(item, register, value, onChange, onBlur)}
                </EuiFormRow>
              )}
            />
        )
      })}
      <EuiButton type="submit">Үүсгэх</EuiButton>
    </EuiForm>
  );
};

const CreateTicketFlyout = () => {
  const router = useRouter();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const {
    data: compactList,
    error,
    isLoading,
    mutate: loadCompactList,
  } = useSWR("/crm/ticket/", async (path) => {
    try {
      const response = await ticketTemplateApi.getCompactList(true);
      const result = response.data.results.map((item) => {
        if (selectedType == null) setSelectedType(item.id);
        return {
          text: item.name,
          value: item.id,
        };
      });
      return result;
    } catch (e) {
      console.error(e);
    }
  });

  const {
    data: selectedTicket,
    error: selectedTicketError,
    isLoading: selectedTicketLoading,
  } = useSWR(selectedType ? `/crm/ticket/${selectedType}/` : null, async (path) => {
    return ticketTemplateApi.getTemplateById(selectedType);
  });

  useEffect(() => {
    if (isFlyoutVisible) {
      loadCompactList();
    }
  }, [isFlyoutVisible, loadCompactList]);

  const ticketTypeChanged = (e) => {
    setSelectedType(e.target.value);
  };

  return (
    <div>
      <EuiButton onClick={() => setIsFlyoutVisible(true)}>Тикет үүсгэх</EuiButton>
      {isFlyoutVisible && (
        <EuiFlyout ownFocus onClose={() => setIsFlyoutVisible(false)}>
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2>Тикет үүсгэх</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiFormRow label="Төрөл">
              <EuiSelect
                hasNoInitialSelection
                options={compactList}
                value={selectedType}
                onChange={ticketTypeChanged}
              />
            </EuiFormRow>

            <EuiSpacer size="m" />

            <EuiSkeletonRectangle
              height="100px"
              width={"100%"}
              isLoading={isLoading || selectedTicketLoading}
            >
              {selectedTicket && <DynamicForm ticket_template_id={selectedType} ticket_template={selectedTicket} /> }
            </EuiSkeletonRectangle>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </div>
  );
};

export default CreateTicketFlyout;
