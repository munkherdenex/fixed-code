import { defaultRuleProcessorMongoDB, RuleProcessor } from "react-querybuilder";

/**
 * @param rule - rule to process
 * @param options - options for the processor
 * @returns the processed rule
 */
export const customRuleProcessor: RuleProcessor = (rule, options) => {
  // The "has" operator is not handled by the default processor
  if (rule.operator === "contains") {
    return `{\"${rule.field}\":{\"$c\":\"${rule.value}\"}}`;
  }

  if (rule.operator === "=") {
    return `{\"${rule.field}\":{\"$eq\":\"${rule.value}\"}}`;
  }

  if (rule.operator === "!=") {
    return `{\"${rule.field}\":{\"$ne\":\"${rule.value}\"}}`;
  }

  if (rule.operator === ">") {
    return `{\"${rule.field}\":{\"$gt\":\"${rule.value}\"}}`;
  }

  if (rule.operator === "<") {
    return `{\"${rule.field}\":{\"$lt\":\"${rule.value}\"}}`;
  }

  // Defer to the default processor for all other operators
  return defaultRuleProcessorMongoDB(rule, options);
};
