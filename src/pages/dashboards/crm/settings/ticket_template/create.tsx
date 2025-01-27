import {
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
  EuiPanel,
  EuiSelect,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTextArea,
  htmlIdGenerator,
} from "@elastic/eui";
import { css } from "@emotion/react";
import { useRef, useState } from "react";

const editorRowStyle = css`
  cursor: pointer;
  border: 2px dashed white;

  &: hover {
    background-color: rgba(255, 255, 0, 0.2);
  }

  &.selected {
    border: 2px dashed orange;
    background-color: rgba(255, 255, 0, 0.2);
  }

  & cover {
    width: 100%;
    height: 100%;
    color: white;
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

const CreateTicketTemplate = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const choiceIds = htmlIdGenerator("choice");
  const inputRefs = useRef({});

  const addItem = (item) => {
    const newItem = {
      id: items.length + 1,
      name: item.name,
      type: item.type,
      config: {
        helpText: "",
        isRequired: false,
      },
    };
    switch (item.type) {
      case "choice": {
        newItem.config.choices = [
          { id: choiceIds(), value: "option1", text: "Сонголт 1" },
          { id: choiceIds(), value: "option2", text: "Сонголт 2" },
        ];
      }
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
    })

    // setTimeout(() => {
    //   // Important: use setTimeout to ensure re-render is complete
    //   if (inputRefs.current[option.id]) {
    //     inputRefs.current[option.id].focus();
    //   }
    // }, 0);
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
  };

  const getComponent = (item) => {
    switch (item.type) {
      case "text":
        return <EuiFieldText />;
      case "number":
        return <EuiFieldNumber />;
      case "choice":
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
        return <EuiButtonIcon iconType={"faceHappy"} />;
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
          setCurrentItem(item);
        }}
        aria-required={item.config.isRequired}
        helpText={item.config.helpText}
        css={editorRowStyle}
        className={currentItem == item ? "selected" : ""}
      >
        {getComponent(item)}
      </EuiFormRow>
    );
  });

  return (
    <>
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
                    <EuiText>{currentItem.type}</EuiText>
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
                  {currentItem.type == 'choice' && (
                    <>
                      <EuiSpacer size="m" />
                      <EuiFlexItem grow={false}>
                        <EuiPanel
                          color="subdued"
                          hasBorder={false}
                          hasShadow={false}
                          paddingSize="none"
                        >
                          <EuiText size="s">Сонголтууд</EuiText>
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
                                            inputRef={(el) => (inputRefs.current[option.id] = el?.input)}
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
                                              // setOptionValue(option, e.target.value);
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

              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={() => {
                    console.log(items);
                  }}
                >
                  Save
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default CreateTicketTemplate;
