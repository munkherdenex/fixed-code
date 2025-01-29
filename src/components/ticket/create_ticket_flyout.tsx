import {
  EuiButton,
  EuiCallOut,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiSkeletonText,
  EuiSpacer,
  EuiText,
  EuiTextArea,
  EuiTitle,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import * as yup from "yup";
import ticketTemplateApi from "../../api/ticket_template";

const schema = yup
  .object({
    status: yup.string().required(),
    title: yup.string().required(),
    description: yup.string(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const CreateTicketFlyout = () => {
  const router = useRouter();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const {
    data: compactList,
    error,
    isLoading,
  } = useSWR("/crm/ticket/", async (path) => {
    try {
      const response = await ticketTemplateApi.getCompactList(true);
      const result = response.results.map((item) => {
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
  } = useSWR(
    selectedType ? `/crm/ticket/${selectedType}/` : null,
    async (path) => {
      return ticketTemplateApi.getTemplateById(selectedType);
    },
  );

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
            <EuiForm>
              <EuiFormRow label="Төрөл">
                <EuiSelect
                  hasNoInitialSelection
                  options={compactList}
                  value={selectedType}
                  onChange={ticketTypeChanged}
                />
              </EuiFormRow>

              <EuiSkeletonText
                lines={3}
                size="m"
                isLoading={selectedTicketLoading}
                contentAriaLabel="Example text"
              >
                <EuiText size="m">
                  <pre>{JSON.stringify(selectedTicket)}</pre>
                </EuiText>
              </EuiSkeletonText>

              <EuiSpacer size="m" />
              <EuiButton type="submit" fill>
                Create
              </EuiButton>
            </EuiForm>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </div>
  );
};

export default CreateTicketFlyout;
