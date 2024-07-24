import { EuiButton, EuiForm, EuiFormRow } from "@elastic/eui";
import { useState } from "react";
import { ActionElement, Field, formatQuery, QueryBuilder, RuleGroupType } from "react-querybuilder";
import { REACT_QUERY_BUILDER_OPERATORS } from "../../constants";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import { dynamicStyles } from "./dynamic.styles";

const fields: Field[] = [
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "rid", label: "Reference id" },
];

const Dynamic = ({
  createSegment,
  isCreateSegmentMutating,
}: {
  createSegment: (data: any) => void;
  isCreateSegmentMutating: boolean;
}) => {
  const styles = dynamicStyles();
  const { data } = useGetFields<Fields[]>(undefined, {
    all: `${true}`,
  });
  const [query, setQuery] = useState<RuleGroupType>({
    combinator: "and",
    rules: [
      { field: "email", operator: "=", value: "" },
      { field: "phone", operator: "=", value: "" },
      { field: "rid", operator: "=", value: "" },
    ],
  });

  const output = Array.isArray(data)
    ? data.map((item) => ({
        name: `cf_${item.attribute_name}`,
        label: `CF ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`,
      }))
    : [];

  const handleSubmit = (createSegment: (data: any) => void) => (e: any) => {
    e.preventDefault();
    createSegment({
      condition: formatQuery(query, "mongodb"),
    });
  };

  return (
    <>
      <EuiForm component="form" onSubmit={handleSubmit(createSegment)}>
        <EuiFormRow css={styles.queryBuilderContainer} label="Team id" fullWidth>
          <QueryBuilder
            fields={[...fields, ...output]}
            query={query}
            operators={REACT_QUERY_BUILDER_OPERATORS}
            onQueryChange={setQuery}
            controlElements={{
              addGroupAction: (props) => (props.level === 0 ? <ActionElement {...props} /> : null),
            }}
          />
        </EuiFormRow>
        <EuiFormRow>
          <EuiButton type="submit" isLoading={isCreateSegmentMutating}>
            Create Segment
          </EuiButton>
        </EuiFormRow>
      </EuiForm>
    </>
  );
};

export default Dynamic;
