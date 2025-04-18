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
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import * as yup from "yup";
import ticketTemplateApi from "../../api/ticket_template";
import getFieldComponent from "../ticket_template/utils";
import { addToast } from "../toast";
import ticketApi from "../../api/ticket";

const schema = yup
  .object({
    status: yup.string().required(),
    title: yup.string().required(),
    description: yup.string(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const DynamicForm = ({ ticket_template_id, ticket_template }) => {
  const [data, setData] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  // const { mutate : createTicket } = useSWR('/crm/ticket/', (_path) => {
  //   ticketsApi.create(ticket_template_id, data)
  // });

  const onSubmit = async (data) => {
    try {
      console.log(data); // Handle form submission
      setData(data);
      const response = await ticketApi.create(ticket_template_id, data);
      if (response.status == 201) {
        addToast({
          id: "success",
          title: "Үүслээ",
          color: "success",
        });
      } else {
        addToast({
          id: "success",
          title: "Алдаа гарлаа",
          color: "warning",
        });
      }
    } catch (e) {
      addToast({
        id: "success",
        title: "ERROR",
        color: "danger",
      });
    }
    return false;
  };

  return (
    <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
      {ticket_template &&
        ticket_template.fields.map((item) => {
          return (
            <Controller
              key={`ctrllr__${item.id}`}
              control={control}
              name={item.attr_name}
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFormRow key={item.id} label={item.name} helpText={item.config?.helpText}>
                  {getFieldComponent(item, register, value, onChange, onBlur)}
                </EuiFormRow>
              )}
            />
          );
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
              {selectedTicket && (
                <DynamicForm ticket_template_id={selectedType} ticket_template={selectedTicket} />
              )}
            </EuiSkeletonRectangle>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </div>
  );
};

export default CreateTicketFlyout;
