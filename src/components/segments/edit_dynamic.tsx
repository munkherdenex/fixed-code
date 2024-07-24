import { EuiButton, EuiFieldText, EuiForm, EuiFormRow, EuiTextArea } from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field, formatQuery, QueryBuilder, RuleGroupType } from "react-querybuilder";
import { parseMongoDB } from "react-querybuilder/parseMongoDB";
import * as yup from "yup";
import { REACT_QUERY_BUILDER_OPERATORS } from "../../constants";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import useUpdateSegment from "../../hooks/useUpdateSegment";
import { globalMutate } from "../../utils/globalMutate";
import { addToast } from "../toast";
import { dynamicStyles } from "./dynamic.styles";

const schema = yup.object({
  name: yup.string().required("please enter your name"),
  description: yup.string().notRequired(),
});

type FormData = yup.InferType<typeof schema>;

const fields: Field[] = [
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "rid", label: "Reference id" },
];

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
  const [query, setQuery] = useState<RuleGroupType>(() => {
    try {
      return parseMongoDB(condition);
    } catch {
      return { id: "root", combinator: "and", rules: [] };
    }
  });

  const { trigger, isMutating } = useUpdateSegment(router.query.id);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      name,
      description,
    },
  });

  const output = Array.isArray(data)
    ? data.map((item) => ({
        name: `cf_${item.attribute_name}`,
        label: `CF ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`,
      }))
    : [];

  const createSegment = async (data: FormData) => {
    try {
      const response = await trigger({
        name: data.name,
        description: data.description,
        condition: formatQuery(query, "mongodb"),
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
        <EuiFormRow css={styles.queryBuilderContainer} label="Team id" fullWidth>
          <QueryBuilder
            fields={[...fields, ...output]}
            query={query}
            operators={REACT_QUERY_BUILDER_OPERATORS}
            onQueryChange={setQuery}
          />
        </EuiFormRow>
        <EuiFormRow>
          <EuiButton type="submit" isLoading={isMutating}>
            Update segment
          </EuiButton>
        </EuiFormRow>
      </EuiForm>
    </>
  );
};

export default EditDynamic;
