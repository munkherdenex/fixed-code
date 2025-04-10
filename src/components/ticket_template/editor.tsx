// Remove @ts-nocheck to enable TypeScript checking

import {
  EuiBadge,
  EuiButton,
  EuiButtonIcon,
  EuiDatePicker,
  EuiFieldNumber,
  EuiFieldText,
  EuiFilePicker,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiInlineEditTitle,
  EuiPanel,
  EuiSelect,
  EuiSelectable,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTextArea,
  EuiTitle,
  htmlIdGenerator,
} from "@elastic/eui";
import { css } from "@emotion/react";
import { useEffect, useState, useImperativeHandle } from "react";
import { TicketTemplate, TicketTemplateField } from "./types";
import ticketTemplateApi from "../../api/ticket_template";
import { addToast } from "../toast";

const editorRowStyle = css`
  cursor: pointer;
  border: 2px dashed white;
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 0, 0.2);
  }

  &.selected {
    border: 2px dashed orange;
    background-color: rgba(255, 255, 0, 0.2);
  }

  & .cover {
    width: 100%;
    height: 100%;
    color: white;
  }
`;

const removeButtonStyle = css`
  position: absolute;
  top: -4px;
  right: -28px;
  cursor: pointer;
  display: none;

  .selected & {
    display: block;
  }
`;

const fields = [
  {
    name: "Text",
    type: "text",
  },
  {
    name: "Number",
    type: "number",
  },
  {
    name: "Choice",
    type: "choice",
  },
  {
    name: "Boolean",
    type: "boolean",
  },
  {
    name: "File",
    type: "file",
  },
  {
    name: "Date",
    type: "date",
  },
  {
    name: "Worker",
    type: "worker",
  },
  {
    name: "Customer",
    type: "customer",
  },
  {
    name: "Emotion",
    type: "emotion",
  },
];

interface TicketTemplateProps {
  initialTicketTemplate: TicketTemplate;
  onChange: CallableFunction;
}

interface TemplateData {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  has_priority: boolean;
}

const TicketTemplateEditor = ({ initialTicketTemplate, onChange }: TicketTemplateProps) => {
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [titleError, setTitleError] = useState(false);
  const choiceIds = htmlIdGenerator("choice");

  useEffect(() => {
    if (initialTicketTemplate == null) return;

    setTemplateData({
      id: initialTicketTemplate.id,
      name: initialTicketTemplate.name,
      description: initialTicketTemplate.description,
      is_active: initialTicketTemplate.is_active,
      has_priority: initialTicketTemplate.has_priority,
    });
    setItems(initialTicketTemplate.fields || []);
  }, [initialTicketTemplate]);

  useEffect(() => {
    if (onChange && templateData && items) {
      onChange(templateData, items); // Notify parent about changes
    }
  }, [templateData, items, onChange]);

  const addItem = (item) => {
    const newItem: TicketTemplateField = {
      id: items.length + 1,
      attr_name: "attr_" + item.type + "_" + (items.length + 1),
      order: items.length + 1,
      name: item.name,
      type: item.type,
      config: {
        helpText: "",
        isRequired: false,
      },
    };
    switch (item.type) {
      case "text":
        {
          newItem.config.isMultiline = false;
        }
        break;
      case "number":
        {
          newItem.config.min = 0;
          newItem.config.max = 100;
          newItem.config.step = 1;
        }
        break;
      case "choice":
        {
          newItem.config.choices = [
            { id: choiceIds(), value: "option1", text: "Сонголт 1" },
            { id: choiceIds(), value: "option2", text: "Сонголт 2" },
          ];
        }
        break;
    }
    setItems([...items, newItem]);
    setCurrentItem(newItem);
  };

  const changePropery = (name, value) => {
    const oldItem = items.find((item) => item.id === currentItem.id);
    if (name == "name") {
      oldItem.name = value;
    } else {
      oldItem.config[name] = value;
    }
    setItems([...items]);
  };

  const addChoice = () => {
    const newChoice = { id: choiceIds(), value: "valueX", text: "Шинэ сонголт" };
    const oldItem = items.find((item) => item.id === currentItem.id);
    if (oldItem.type == "choice") {
      if (!oldItem.config.choices) oldItem.config.choices = [];

      oldItem.config.choices.push(newChoice);
    }
    setItems([...items]);
  };

  const removeChoice = (option) => {
    const oldItem = items.find((item) => item.id === currentItem.id);
    if (oldItem.type == "choice") {
      oldItem.config.choices.splice(oldItem.config.choices.indexOf(option), 1);
    }
    setItems([...items]);
  };

  const setOptionName = (option, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === currentItem.id && item.type === "choice" && item.config?.choices) {
          return {
            ...item,
            config: {
              ...item.config,
              choices: item.config.choices.map((choice) => {
                if (choice.id === option.id) {
                  return { ...choice, text: value };
                }
                return choice;
              }),
            },
          };
        }
        return item;
      }),
    );

    setCurrentItem((oldItem) => {
      return {
        ...oldItem,
        config: {
          ...oldItem.config,
          choices: oldItem.config.choices.map((choice) => {
            if (choice.id === option.id) {
              return { ...choice, text: value };
            }
            return choice;
          }),
        },
      };
    });
  };

  const setOptionValue = (option, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === currentItem.id && item.type === "choice" && item.config?.choices) {
          return {
            ...item,
            config: {
              ...item.config,
              choices: item.config.choices.map((choice) => {
                if (choice === option) {
                  return { ...choice, value: value };
                }
                return choice;
              }),
            },
          };
        }
        return item;
      }),
    );

    setCurrentItem((oldItem) => {
      return {
        ...oldItem,
        config: {
          ...oldItem.config,
          choices: oldItem.config.choices.map((choice) => {
            if (choice.id === option.id) {
              return { ...choice, value: value };
            }
            return choice;
          }),
        },
      };
    });
  };

  const removeItem = (item) => {
    setItems(items.filter((i) => i.id !== item.id));
    setCurrentItem(null);
  };

  const getComponent = (item) => {
    switch (item.type) {
      case "text":
        if (item.config?.isMultiline) {
          return <EuiTextArea />;
        }
        return <EuiFieldText />;
      case "number":
        return (
          <EuiFieldNumber min={item.config?.min} max={item.config?.max} step={item.config?.step} />
        );
      case "choice":
        if (item.config?.isMultiple) {
          return <EuiSelectable options={item.config?.choices} />;
        }
        return <EuiSelect options={item.config?.choices} />;
      case "boolean":
        return <EuiSwitch label="Switch" checked={false} onChange={() => {}} />;
      case "file":
        return <EuiFilePicker disabled={true} />;
      case "date":
        return <EuiDatePicker />;
      case "worker":
        return (
          <>
            <EuiButton size="s">Select worker</EuiButton>
          </>
        );
      case "customer":
        return (
          <>
            <EuiButton size="s">Select customer</EuiButton>
          </>
        );
      case "emotion":
        return (
          <>
            <EuiButtonIcon display="base" size="m" iconType={"faceSad"} color="danger" />
            <EuiButtonIcon display="base" size="m" iconType={"faceSad"} color="warning" />
            <EuiButtonIcon display="base" size="m" iconType={"faceNeutral"} color="text" />
            <EuiButtonIcon display="base" size="m" iconType={"faceHappy"} color="primary" />
            <EuiButtonIcon display="base" size="m" iconType={"faceHappy"} color="success" />
          </>
        );
      default:
        return <EuiFieldText name={item.name} />;
    }
  };

  const itemsList = items.map((item) => {
    return (
      <EuiFormRow
        key={item.name + Math.random()}
        label={item.name}
        onClick={() => {
          if (currentItem != item) {
            setCurrentItem(item);
          }
        }}
        aria-required={item.config?.isRequired}
        helpText={item.config?.helpText}
        css={editorRowStyle}
        className={currentItem == item ? "selected" : ""}
      >
        <>
          {getComponent(item)}
          <EuiButtonIcon
            css={removeButtonStyle}
            iconType="cross"
            aria-label="Remove"
            color="danger"
            display="base"
            onClick={() => removeItem(item)}
          />
        </>
      </EuiFormRow>
    );
  });

  return (
    <>
      <EuiFlexItem grow={1}>
        <EuiPanel hasShadow={false}>
          {templateData && (
            <EuiInlineEditTitle
              heading="h1"
              inputAriaLabel="Тикетийн нэр бичих"
              defaultValue={templateData.name}
              isInvalid={titleError}
              onSave={(value: string) => {
                if (value != null && value.length > 2 && templateData.name != value) {
                  setTemplateData((prev) => ({
                    ...prev,
                    name: value,
                  }));
                  setTitleError(false)
                } else {
                  setTitleError(true)
                  addToast({
                    id: Math.random()+"__key",
                    title: "Алдаа",
                    color: "danger",
                    text: "Тикетийн нэр 2 тэмдэгтээс урт байх ёстой.",
                  });
                  return false;
                }
              }}
            />
          )}
        </EuiPanel>
      </EuiFlexItem>
      <EuiFlexGroup
        css={css`
          margin-bottom: 15px;
        `}
      >
        <EuiFlexItem grow={1}>
          <EuiPanel hasShadow={false}>
            <EuiFormRow label="Тайлбар" fullWidth>
              <EuiTextArea
                fullWidth
                value={templateData?.description || ""}
                rows={3}
                onChange={(e) =>
                  setTemplateData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </EuiFormRow>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem grow={1}>
          <EuiPanel hasShadow={false}>
            <EuiFormRow label="Идэвхитэй эсэх">
              <EuiSwitch
                label="Идэвхитэй эсэх"
                checked={templateData?.is_active || false}
                color="primary"
                onChange={(e) => {
                  setTemplateData((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }));
                }}
              />
            </EuiFormRow>
            <EuiFormRow
              label="Чухлын зэрэг ашиглах эсэх"
              helpText=<EuiText size="xs">Чухлын зэргийн тохиргоог хажуу цэснээс харна уу.</EuiText>
            >
              <EuiSwitch
                label="Чухлын зэрэг ашиглах эсэх"
                checked={templateData?.has_priority || false}
                onChange={(e) => {
                  setTemplateData((prev) => ({
                    ...prev,
                    has_priority: e.target.checked,
                  }));
                }}
              />
            </EuiFormRow>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiPanel hasShadow={false}>
            <EuiFlexGrid columns={2} gutterSize="s">
              {fields.map((field) => {
                return (
                  <EuiFlexItem key={field.name + field.type} grow={false}>
                    <EuiButton
                      onClick={() => {
                        addItem(field);
                      }}
                    >
                      {field.name}
                    </EuiButton>
                  </EuiFlexItem>
                );
              })}
            </EuiFlexGrid>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem grow={4}>
          <EuiPanel>{items && itemsList}</EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiPanel hasShadow={false}>
            <EuiFlexGroup direction="column">
              {currentItem && (
                <EuiFlexItem grow={false}>
                  <EuiFormRow label={"Төрөл"}>
                    <EuiBadge color="hollow">{currentItem.type}</EuiBadge>
                  </EuiFormRow>
                  <EuiFormRow label={"Нэр"}>
                    <EuiFieldText
                      compressed
                      value={currentItem ? currentItem.name : ""}
                      onChange={(e) => {
                        changePropery("name", e.target.value);
                      }}
                    />
                  </EuiFormRow>
                  <EuiFormRow label={"Нэмэлт тайлбар"}>
                    <EuiTextArea
                      compressed
                      value={currentItem ? currentItem.config?.helpText : ""}
                      rows={2}
                      onChange={(e) => {
                        console.log(e.target.value);
                        changePropery("helpText", e.target.value);
                      }}
                    />
                  </EuiFormRow>
                  <EuiFormRow label={"Заавал бөглөх эсэх"}>
                    <EuiSwitch
                      compressed
                      label="Switch"
                      checked={currentItem.config?.isRequired || false}
                      onChange={(e) => {
                        console.log(e);
                        changePropery("isRequired", e.target.checked);
                      }}
                    />
                  </EuiFormRow>
                  {currentItem.type == "number" && (
                    <>
                      <EuiSpacer size="m" />
                      <EuiFlexItem grow={false}>
                        <EuiPanel
                          color="subdued"
                          hasBorder={false}
                          hasShadow={false}
                          paddingSize="none"
                        >
                          <EuiFormRow display="columnCompressed" label="Хамгийн бага утга">
                            <EuiFieldNumber
                              compressed
                              value={currentItem.config?.min || false}
                              onChange={(e) => {
                                changePropery("min", e.target.value);
                              }}
                            />
                          </EuiFormRow>
                          <EuiFormRow display="columnCompressed" label="Хамгийн их утга">
                            <EuiFieldNumber
                              compressed
                              value={currentItem.config?.max || false}
                              onChange={(e) => {
                                changePropery("max", e.target.value);
                              }}
                            />
                          </EuiFormRow>
                          <EuiFormRow display="columnCompressed" label="Алхам">
                            <EuiFieldNumber
                              compressed
                              value={currentItem.config?.step || false}
                              onChange={(e) => {
                                changePropery("step", e.target.value);
                              }}
                            />
                          </EuiFormRow>
                        </EuiPanel>
                      </EuiFlexItem>
                    </>
                  )}
                  {currentItem.type == "text" && (
                    <>
                      <EuiSpacer size="m" />
                      <EuiFlexItem grow={false}>
                        <EuiPanel
                          color="subdued"
                          hasBorder={false}
                          hasShadow={false}
                          paddingSize="none"
                        >
                          <EuiFormRow display="columnCompressed" label="Урт текст">
                            <EuiSwitch
                              showLabel={false}
                              label="Autoscaling"
                              checked={currentItem.config?.isMultiline || false}
                              onChange={(e) => {
                                changePropery("isMultiline", e.target.checked);
                              }}
                              compressed
                            />
                          </EuiFormRow>
                        </EuiPanel>
                      </EuiFlexItem>
                    </>
                  )}
                  {currentItem.type == "choice" && (
                    <>
                      <EuiSpacer size="m" />
                      <EuiFlexItem grow={false}>
                        <EuiPanel
                          color="subdued"
                          hasBorder={false}
                          hasShadow={false}
                          paddingSize="none"
                        >
                          <EuiTitle size="xxxs">
                            <span>Сонголтууд</span>
                          </EuiTitle>
                          <EuiFlexGroup direction="column" gutterSize="s">
                            {currentItem.config?.choices &&
                              currentItem.config?.choices.map((option) => {
                                return (
                                  <EuiFlexItem key={option.id}>
                                    <EuiFlexGroup gutterSize="s">
                                      <EuiFlexItem grow={false} style={{ width: 100 }}>
                                        <EuiFormRow>
                                          <EuiFieldText
                                            compressed
                                            placeholder="Нэр"
                                            value={option.text}
                                            onChange={(e) => {
                                              setOptionName(option, e.target.value);
                                            }}
                                          />
                                        </EuiFormRow>
                                      </EuiFlexItem>
                                      <EuiFlexItem>
                                        <EuiFormRow>
                                          <EuiFieldText
                                            compressed
                                            placeholder="Утга"
                                            value={option.value}
                                            onChange={(e) => {
                                              setOptionValue(option, e.target.value);
                                            }}
                                          />
                                        </EuiFormRow>
                                      </EuiFlexItem>
                                      <EuiFlexItem grow={false}>
                                        <EuiButtonIcon
                                          size="xs"
                                          color="danger"
                                          iconType={"trash"}
                                          onClick={() => removeChoice(option)}
                                        />
                                      </EuiFlexItem>
                                    </EuiFlexGroup>
                                  </EuiFlexItem>
                                );
                              })}
                            <EuiButton size="s" fullWidth={true} onClick={addChoice}>
                              Сонголт нэмэх
                            </EuiButton>
                          </EuiFlexGroup>
                        </EuiPanel>
                      </EuiFlexItem>
                    </>
                  )}
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default TicketTemplateEditor;
