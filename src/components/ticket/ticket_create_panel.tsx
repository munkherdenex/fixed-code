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
  EuiText,
  EuiFieldText,
  EuiForm,
} from "@elastic/eui";
import ticketTemplateApi from "@/api/ticket_template";

interface TicketCreatePanelProps {
  ticketId?: string;
  callLog?: string;
  chatLog?: string;
}

const TicketCreatePanel: React.FC<TicketCreatePanelProps> = ({ ticketId, callLog, chatLog }) => {
  const [type, setType] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [ticketCreated, setTicketCreated] = useState(!!ticketId);
  const [typeOptions, setTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  // Fetch ticket types from the API
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await ticketTemplateApi.getCompactList(true); // Fetch active templates
        const options = response.data.results.map((item: { id: number; name: string }) => ({
          label: item.name,
          value: item.id.toString(),
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

  const handleCreateTicket = () => {
    if (!ticketCreated) {
      setTicketCreated(true);
    }
  };

  return (
    <EuiSplitPanel.Outer hasShadow={false} hasBorder>
      <EuiSplitPanel.Inner color="subdued" paddingSize="m">
        Тикет
      </EuiSplitPanel.Inner>
      <EuiPanel paddingSize="m" color="warning" borderRadius='none'>
        {ticketCreated ? (
          <div>
            <h3>Тикетийн мэдээлэл</h3>
            <p>
              <strong>Төрөл:</strong>{" "}
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
            <EuiFlexGroup direction="column" gutterSize='s'>
              <EuiFlexItem>
                <EuiFormRow label="Төрөл">
                  <EuiComboBox
                    fullWidth
                    placeholder="Төрөл сонгоно уу"
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
                <EuiFormRow label="Гарчиг">
                  <EuiFieldText
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Гарчиг оруулна уу"
                    disabled={isLoadingTypes}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow label="Дэлгэрэнгүй">
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
                <EuiButton onClick={handleCreateTicket} fill isDisabled={isLoadingTypes}>
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
