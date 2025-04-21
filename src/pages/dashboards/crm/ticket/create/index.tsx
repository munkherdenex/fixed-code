import React, { useState } from "react";
import {
  EuiButton,
  EuiCheckboxGroup,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiLink,
  EuiRange,
  EuiSelect,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  useGeneratedHtmlId,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiTextArea,
  EuiButtonEmpty,
  EuiSkeletonRectangle,
} from "@elastic/eui";
import DashboardCRMLayout from "@/layouts/dashboard_crm";
import { useRouter } from "next/router";
import useSWR from "swr";
import ticketTemplateApi from "@/api/ticket_template";
import ticketApi from "@/api/ticket";
import { addToast } from "@/components/toast";
import { useForm } from "react-hook-form";

const TicketCreate = () => {
  const router = useRouter();
  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });
  const [ticketType, setTicketType] = useState(null);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [typeError, setTypeError] = useState<string | undefined>(undefined);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const {
    data: compactList,
    error,
    isLoading,
    mutate: loadCompactList,
  } = useSWR("/crm/ticket/", async (path) => {
    try {
      const response = await ticketTemplateApi.getCompactList(true);
      const result = response.data.results.map((item) => {
        if (ticketType == null) setTicketType(item.id);
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

  // const {
  //   data: selectedTicket,
  //   error: selectedTicketError,
  //   isLoading: selectedTicketLoading,
  // } = useSWR(ticketType ? `/crm/ticket/${ticketType}/` : null, async (path) => {
  //   return ticketTemplateApi.getTemplateById(ticketType);
  // });

  const onSubmit = async (data) => {
    if (!ticketTitle.trim()) {
      setTitleError("Нэр хоосон байж болохгүй.");
      if (!ticketType) {
        setTypeError("Төрөл хоосон байж болохгүй.");
      }
      return;
    }

    try {
      const response = await ticketApi.create(ticketType, data);
      console.log(response);
      if (response.status == 201) {
        addToast({
          id: "success",
          title: "Үүслээ",
          color: "success",
        });
        if (response.data) {
          router.push(`/dashboards/crm/ticket/${response?.data?.id}`);
        } else {
          router.push("/dashboards/crm/ticket?pageIndex=1&pageSize=10");
        }
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
    <DashboardCRMLayout
      breadCrumb={[
        {
          text: (
            <>
              <EuiButtonIcon
                display="base"
                iconType="arrowLeft"
                size="s"
                color="text"
                aria-label="back"
              />
            </>
          ),
          color: "primary",
          "aria-current": false,
          onClick: () => router.back(),
        },
        {
          text: "Тикет",
          onClick: () => router.push("/dashboards/crm/ticket?pageIndex=1&pageSize=10"),
        },
        {
          text: "Тикет үүсгэх",
        },
      ]}
    >
      <EuiFlexGroup justifyContent="spaceAround">
        <EuiFlexItem grow={false}>
          <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
            <EuiFormRow label="Төрөл" isInvalid={!!typeError} error={typeError}>
              <EuiSelect
                isInvalid={!!typeError}
                id={basicSelectId}
                hasNoInitialSelection
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                options={compactList}
              />
            </EuiFormRow>

            <EuiFormRow label="Тикетийн нэр" isInvalid={!!titleError} error={titleError}>
              <EuiFieldText
                isInvalid={!!titleError}
                name="first"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="Нэр"
              />
            </EuiFormRow>

            <EuiFormRow label="Тайлбар">
              <EuiTextArea
                placeholder="Текст"
                aria-label="Use aria labels when no actual label is in use"
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
              />
            </EuiFormRow>

            <EuiSpacer />
            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexItem>
                <EuiButtonEmpty onClick={() => router.push("/dashboards/crm/ticket")}>
                  Болих
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiButton type="submit" fill>
                  Үүсгэх
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiForm>
        </EuiFlexItem>
      </EuiFlexGroup>
    </DashboardCRMLayout>
  );
};

export default TicketCreate;
