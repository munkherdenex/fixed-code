import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiTextArea } from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { jsonrepair } from "jsonrepair";
import { useRouter } from "next/router";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActionElement, formatQuery, QueryBuilder, RuleGroupType } from "react-querybuilder";
import { parseMongoDB } from "react-querybuilder/parseMongoDB";
import * as yup from "yup";
import { QUERY_BUILDER_DEFAULT_FIELD, REACT_QUERY_BUILDER_OPERATORS } from "../../constants";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import useUpdateSegment from "../../hooks/useUpdateSegment";
import { additionalOperator } from "../../utils/additional_operator";
import { CustomValueEditor } from "../../utils/custom_value_editor";
import { globalMutate } from "../../utils/globalMutate";
import { isNotValid, removeDeletedCustomFields } from "../../utils/helper";
import { processDynamicFieldData } from "../../utils/process_data";
import { customRuleProcessor } from "../../utils/rule_processer";
import { addToast } from "../toast";
import { dynamicStyles } from "./dynamic.styles";

const schema = yup.object({
  name: yup.string().required("please enter your name"),
  description: yup.string().notRequired(),
});

type FormData = yup.InferType<typeof schema>;

const EditDynamic = ({
  name,
  description,
  condition,
  closeFlyout,
}: {
  name: string;
  description: string;
  condition: string;
  closeFlyout: () => void;
}) => {
  const styles = dynamicStyles();
  const router = useRouter();
  const { data } = useGetFields<Fields[]>(undefined, {
    all: `${true}`,
  });
  const [query, setQuery] = useState<RuleGroupType>();

  const { trigger, isMutating } = useUpdateSegment(router.query.id);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name,
      description,
    },
  });

  const output = useMemo(() => processDynamicFieldData(data), [data]);

  useLayoutEffect(() => {
    setQuery(() =>
      removeDeletedCustomFields(
        data,
        parseMongoDB(condition, {
          additionalOperators: additionalOperator,
        }),
      ),
    );
  }, [data, condition]);

  const createSegment = async (data: FormData) => {
    try {
      const response = await trigger({
        name: data?.name,
        description: data?.description,
        condition: jsonrepair(
          formatQuery(JSON.parse(JSON.stringify(query)), {
            format: "mongodb",
            ruleProcessor: customRuleProcessor,
          }),
        ),
        type: "dynamic",
      });
      if (response) {
        globalMutate("/api/v1/dj/segments/");
        closeFlyout();
      }
    } catch (error) {
      addToast({
        id: "error",
        title: "Error",
        color: "danger",
        text: error.message,
      });
    }
  };

  return (
    <>
      <EuiForm component="form" onSubmit={handleSubmit(createSegment)}>
        <EuiFormRow label="Title" isInvalid={!!errors.name?.message} error={[errors.name?.message]}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <EuiFieldText
                onChange={onChange}
                value={value}
                onBlur={onBlur}
                placeholder="title"
                fullWidth
                required
                isInvalid={!!errors.name?.message}
              />
            )}
          />
        </EuiFormRow>
        <EuiFormRow label="Description">
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <EuiTextArea
                onChange={onChange}
                value={value}
                onBlur={onBlur}
                placeholder="Placeholder text"
                name="description"
                aria-label="Use aria labels when no actual label is in use"
              />
            )}
          />
        </EuiFormRow>
        {query && (
          <EuiFormRow css={styles.queryBuilderContainer} label="Dynamic query builder" fullWidth>
            <QueryBuilder
              fields={[...QUERY_BUILDER_DEFAULT_FIELD, ...output]}
              query={query}
              operators={REACT_QUERY_BUILDER_OPERATORS}
              onQueryChange={setQuery}
              controlElements={{
                addGroupAction: (props) =>
                  props.level === 0 ? <ActionElement {...props} /> : null,
                valueEditor: CustomValueEditor,
              }}
            />
          </EuiFormRow>
        )}
        <EuiFormRow>
          <EuiButton disabled={isNotValid(query)} type="submit" isLoading={isMutating}>
            Update segment
          </EuiButton>
        </EuiFormRow>
      </EuiForm>
    </>
  );
};

export default EditDynamic;
