import React, { useState, useEffect } from "react";
import {
  EuiPanel,
  EuiTextArea,
  EuiButton,
  EuiFormRow,
  EuiSplitPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiComboBox,
  EuiFieldText,
  EuiForm,
} from "@elastic/eui";
import ticketTemplateApi from "@/api/ticket_template";
import ticketApi from "@/api/ticket";
import useSWRMutation from "swr/mutation";

interface TicketCreatePanelProps {
  ticketId?: string;
  contactLog?: any;
}

const TicketCreatePanel: React.FC<TicketCreatePanelProps> = ({ ticketId, contactLog }) => {
  const [type, setType] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [ticketCreated, setTicketCreated] = useState(!!ticketId);
  const [typeOptions, setTypeOptions] = useState<{ label: string; value: number }[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [formErrors, setFormErrors] = useState<{ type?: string; title?: string; details?: string }>({});

  // Fetch ticket types from the API
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await ticketTemplateApi.getCompactList(true); // Fetch active templates
        const options = response.data.results.map((item: { id: number; name: string }) => ({
          value: item.id,
          label: item.name,
        }));
        setTypeOptions(options);
      } catch (error) {
        console.error("Failed to fetch ticket types:", error);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchTypes();
  }, []);

  const {
    trigger: createTicket,
    data: createdTicket,
    isMutating,
    error: createTicketError
  } = useSWRMutation(
    "/api/tickets", // API endpoint
    async (url, { arg }: { arg: { type: number; title: string; details: string } }) => {
      const response = await ticketApi.create(arg.type, {
        title: arg.title,
        body: arg.details,
        ...(contactLog ? { cl_id: contactLog.id } : {}),
      });
      return response.data;
    },
  );

  const handleCreateTicket = async () => {
    const errors: { type?: string; title?: string; details?: string } = {};

    if (!type) errors.type = "Категори сонгох шаардлагатай.";
    if (!title.trim()) errors.title = "Гарчиг оруулах шаардлагатай.";
    if (!details.trim()) errors.details = "Дэлгэрэнгүй мэдээлэл оруулах шаардлагатай.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await createTicket({
        type: type,
        title,
        details,
      });
      setTicketCreated(true);
      setFormErrors({});
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  return (
    <EuiSplitPanel.Outer hasShadow={false} hasBorder>
      <EuiSplitPanel.Inner color="subdued" paddingSize="m">
        Тикет {contactLog?.id}
      </EuiSplitPanel.Inner>
      <EuiPanel paddingSize="m" color="warning" borderRadius="none">
        {ticketCreated ? (
          <div>
            <h3>Тикетийн мэдээлэл</h3>
            <p>
              <strong>Категори:</strong>{" "}
              {typeOptions.find((option) => option.value === type)?.label || "Сонгогдоогүй"}
            </p>
            <p>
              <strong>Гарчиг:</strong> {title}
            </p>
            <p>
              <strong>Дэлгэрэнгүй:</strong> {details}
            </p>
          </div>
        ) : (
          <EuiForm fullWidth>
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem>
                <EuiFormRow
                  label="Категори"
                  isInvalid={!!formErrors.type}
                  error={formErrors.type}
                >
                  <EuiComboBox
                    fullWidth
                    placeholder="Категори сонгоно уу"
                    singleSelection={{ asPlainText: true }}
                    options={typeOptions}
                    selectedOptions={
                      type
                        ? [
                            {
                              label:
                                typeOptions.find((option) => option.value === type)?.label || "",
                              value: type,
                            },
                          ]
                        : []
                    }
                    onChange={(selected) =>
                      setType(selected.length > 0 ? selected[0].value : undefined)
                    }
                    isLoading={isLoadingTypes}
                    isDisabled={isLoadingTypes}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow
                  label="Гарчиг"
                  isInvalid={!!formErrors.title}
                  error={formErrors.title}
                >
                  <EuiFieldText
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Гарчиг оруулна уу"
                    disabled={isLoadingTypes}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow
                  label="Дэлгэрэнгүй"
                  isInvalid={!!formErrors.details}
                  error={formErrors.details}
                >
                  <EuiTextArea
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Дэлгэрэнгүй мэдээлэл оруулна уу"
                    disabled={isLoadingTypes}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                {createTicketError && (
                  <EuiFormRow>
                    <p style={{ color: "red" }}>{JSON.stringify(createTicketError.message)}</p>
                  </EuiFormRow>
                )}
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiButton
                  onClick={handleCreateTicket}
                  fill
                  isLoading={isMutating}
                  isDisabled={isLoadingTypes || isMutating}
                >
                  Үүсгэх
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiForm>
        )}
      </EuiPanel>
    </EuiSplitPanel.Outer>
  );
};

export default TicketCreatePanel;
