import DashboardCRMLayout from "../../../../../layouts/dashboard_crm";

import {
  EuiAccordion,
  EuiButton,
  EuiButtonIcon,
  EuiDragDropContext,
  euiDragDropCopy,
  euiDragDropReorder,
  EuiDraggable,
  EuiDroppable,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiPanel,
  EuiSpacer,
  htmlIdGenerator,
} from "@elastic/eui";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const makeId = htmlIdGenerator();

const customFields = [
  {
    id: makeId(),
    name: "checkbox",
  },
  {
    id: makeId(),
    name: "date",
  },
  {
    id: makeId(),
    name: "input",
  },
];

const schema = yup
  .object({
    data: yup
      .array()
      .of(
        yup.object({
          name: yup.string().required(),
          id: yup.string().required(),
        }),
      )
      .required(),
  })
  .required();

const CustomField = ({
  name,
  control,
  index,
}: {
  name: string;
  id: string;
  control;
  index: number;
}) => {
  const content = useMemo(() => {
    if (name === "checkbox") {
      return (
        <div>
          <Controller
            name={`data.${index}.name`}
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <EuiFieldText value={value} onChange={onChange} onBlur={onBlur} />
            )}
          />
        </div>
      );
    }
    if (name === "date") {
      return (
        <div>
          <Controller
            name={`data.${index}.name`}
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <EuiFieldText value={value} onChange={onChange} onBlur={onBlur} />
            )}
          />
        </div>
      );
    }
    if (name === "input") {
      return (
        <div>
          <Controller
            name={`data.${index}.name`}
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <EuiFieldText value={value} onChange={onChange} onBlur={onBlur} />
            )}
          />
        </div>
      );
    }
    return <div>Unknown type</div>;
  }, [name, control, index]);

  return (
    <EuiAccordion id={makeId()} arrowDisplay="right" buttonContent={name}>
      <EuiFormRow label="Name" fullWidth>
        {content}
      </EuiFormRow>
    </EuiAccordion>
  );
};

const DragAndDrop = () => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });
  const { fields, remove, swap, insert } = useFieldArray({
    control,
    name: "data",
  });

  const [isItemRemovable, setIsItemRemovable] = useState(false);
  const [list1, setList1] = useState(customFields);
  const [list2, setList2] = useState<typeof customFields>([]);

  const lists = { DROPPABLE_AREA_COPY_1: list1, DROPPABLE_AREA_COPY_2: list2 };
  const actions = {
    DROPPABLE_AREA_COPY_1: setList1,
    DROPPABLE_AREA_COPY_2: setList2,
  };

  const removeField = (droppableId: string, index: number) => {
    const list = Array.from(lists[droppableId]);
    list.splice(index, 1);

    remove(index);
    actions[droppableId](list);
  };

  const onDragUpdate = ({ source, destination }) => {
    const shouldRemove = !destination && source.droppableId === "DROPPABLE_AREA_COPY_2";
    setIsItemRemovable(shouldRemove);
  };

  const onDragEnd = ({ source, destination }) => {
    if (source && destination) {
      if (source.droppableId === destination.droppableId) {
        const items = euiDragDropReorder(
          lists[destination.droppableId],
          source.index,
          destination.index,
        );

        actions[destination.droppableId](items);
        swap(source.index, destination.index);
      } else {
        const sourceId = source.droppableId;
        const destinationId = destination.droppableId;
        const result = euiDragDropCopy(lists[sourceId], lists[destinationId], source, destination, {
          property: "id",
          modifier: makeId,
        });

        actions[sourceId](result[sourceId]);
        actions[destinationId](result[destinationId]);
        insert(destination.index, {
          name: result[destinationId][destination.index].name,
          id: result[destinationId][destination.index].id,
        });
      }
    } else if (!destination && source.droppableId === "DROPPABLE_AREA_COPY_2") {
      removeField(source.droppableId, source.index);
    }
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
      <EuiDragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ width: "50%" }}>
            <EuiDroppable droppableId="DROPPABLE_AREA_COPY_2" withPanel grow>
              {fields.length ? (
                fields.map(({ name, id }, index: number) => (
                  <EuiDraggable
                    key={id}
                    index={index}
                    draggableId={id}
                    spacing="l"
                    isRemovable={isItemRemovable}
                  >
                    <EuiPanel>
                      <EuiFlexGroup gutterSize="none" alignItems="center">
                        <EuiFlexItem>
                          <CustomField name={name} id={id} control={control} index={index} />
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          {isItemRemovable ? (
                            <EuiIcon type="trash" color="danger" />
                          ) : (
                            <EuiButtonIcon
                              iconType="cross"
                              aria-label="Remove"
                              onClick={() => removeField("DROPPABLE_AREA_COPY_2", index)}
                            />
                          )}
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiPanel>
                  </EuiDraggable>
                ))
              ) : (
                <EuiFlexGroup
                  alignItems="center"
                  justifyContent="spaceAround"
                  gutterSize="none"
                  style={{ height: "100%" }}
                >
                  <EuiFlexItem grow={false}>Drop Items Here</EuiFlexItem>
                </EuiFlexGroup>
              )}
            </EuiDroppable>
          </EuiFlexItem>
          <EuiFlexItem style={{ width: "50%" }}>
            <EuiDroppable
              droppableId="DROPPABLE_AREA_COPY_1"
              cloneDraggables={true}
              spacing="l"
              grow
            >
              {list1.map(({ name, id }, idx) => (
                <EuiDraggable key={id} index={idx} draggableId={id} spacing="l">
                  <EuiPanel>{name}</EuiPanel>
                </EuiDraggable>
              ))}
            </EuiDroppable>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiDragDropContext>
      <EuiSpacer size="l" />
      <EuiButton type="submit">Submit</EuiButton>
    </EuiForm>
  );
};

const FieldTemplateCreate = () => {
  return (
    <DashboardCRMLayout>
      <div>
        <DragAndDrop />
      </div>
    </DashboardCRMLayout>
  );
};

export default FieldTemplateCreate;
