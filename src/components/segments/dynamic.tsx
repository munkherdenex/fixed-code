import { EuiButton, EuiForm, EuiFormRow } from "@elastic/eui";
import { jsonrepair } from "jsonrepair";
import { useState } from "react";
import { ActionElement, formatQuery, QueryBuilder, RuleGroupType } from "react-querybuilder";
import { QUERY_BUILDER_DEFAULT_FIELD, REACT_QUERY_BUILDER_OPERATORS } from "../../constants";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import { CustomValueEditor } from "../../utils/custom_value_editor";
import { isNotValid } from "../../utils/helper";
import { processDynamicFieldData } from "../../utils/process_data";
import { customRuleProcessor } from "../../utils/rule_processer";
import { dynamicStyles } from "./dynamic.styles";

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

  const output = processDynamicFieldData(data);

  const handleSubmit = (createSegment: (data: any) => void) => (e: any) => {
    e.preventDefault();
    createSegment({
      condition: jsonrepair(
        formatQuery(JSON.parse(JSON.stringify(query)), {
          format: "mongodb",
          ruleProcessor: customRuleProcessor,
        }),
      ),
    });
  };

  return (
    <>
      <EuiForm component="form" onSubmit={handleSubmit(createSegment)}>
        <EuiFormRow css={styles.queryBuilderContainer} label="Dynamic query builder" fullWidth>
          <QueryBuilder
            fields={[...QUERY_BUILDER_DEFAULT_FIELD, ...output]}
            query={query}
            operators={REACT_QUERY_BUILDER_OPERATORS}
            onQueryChange={setQuery}
            controlElements={{
              addGroupAction: (props) => (props.level === 0 ? <ActionElement {...props} /> : null),
              valueEditor: CustomValueEditor,
            }}
          />
        </EuiFormRow>
        <EuiFormRow>
          <EuiButton disabled={isNotValid(query)} type="submit" isLoading={isCreateSegmentMutating}>
            Create Segment
          </EuiButton>
        </EuiFormRow>
      </EuiForm>
    </>
  );
};

export default Dynamic;
