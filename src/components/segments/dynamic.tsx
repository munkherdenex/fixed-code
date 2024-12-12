import { EuiButton, EuiForm, EuiFormRow } from "@elastic/eui";
import { jsonrepair } from "jsonrepair";
import { useRouter } from "next/router";
import { useState } from "react";
import { ActionElement, formatQuery, QueryBuilder, RuleGroupType } from "react-querybuilder";
import { QUERY_BUILDER_DEFAULT_FIELD, REACT_QUERY_BUILDER_OPERATORS } from "../../constants";
import useCreateSegmentDynamic from "../../hooks/useCreateSegmentDynamic";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import { CustomValueEditor } from "../../utils/custom_value_editor";
import { isNotValid } from "../../utils/helper";
import { processDynamicFieldData } from "../../utils/process_data";
import { customRuleProcessor } from "../../utils/rule_processer";
import { dynamicStyles } from "./dynamic.styles";
import { useTranslations } from "next-intl";

const Dynamic = ({ name, description }: { name: string; description: string }) => {
  const styles = dynamicStyles();
  const router = useRouter();
  const translate = useTranslations();

  const { trigger: createSegmentDynamic, isMutating: isCreateSegmentDynamicMutating } =
    useCreateSegmentDynamic();
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

  const createSegment = async (e) => {
    e.preventDefault();
    const dynamicResponse = await createSegmentDynamic({
      name,
      description,
      type: "dynamic",
      condition: jsonrepair(
        formatQuery(JSON.parse(JSON.stringify(query)), {
          format: "mongodb",
          ruleProcessor: customRuleProcessor,
        }),
      ),
    });

    if (dynamicResponse) {
      router.push("/dashboards/cdp/segments");
    }
  };

  return (
    <>
      <EuiForm component="form" onSubmit={createSegment}>
        <EuiFormRow
          css={styles.queryBuilderContainer}
          label={translate("dynamic-query-builder")}
          fullWidth
        >
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
          <EuiButton
            disabled={isNotValid(query)}
            type="submit"
            isLoading={isCreateSegmentDynamicMutating}
          >
            {translate("create-segment")}
          </EuiButton>
        </EuiFormRow>
      </EuiForm>
    </>
  );
};

export default Dynamic;
