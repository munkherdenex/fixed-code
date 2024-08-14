import { RuleGroupType, RuleValidator, ValidationResult } from "react-querybuilder";
import { Fields } from "../hooks/useGetFields";

export const removeDeletedCustomFields = (data: Fields[], query: RuleGroupType) => {
  const fields = [...(data ? data?.map((item) => `cf_${item.name}`) : []), "email", "phone", "rid"];

  // Recursive function to filter rules
  const filterRules = (rules: any) => {
    return rules.filter((rule: any) => {
      const isFieldValid = fields.includes(rule?.field);
      if (rule?.rules) {
        rule.rules = filterRules(rule.rules); // Recursively filter nested rules
      }
      return isFieldValid || (rule?.rules && rule.rules.length > 0);
    });
  };

  const filteredRules = filterRules(query.rules);
  return { ...query, rules: filteredRules };
};

/**
 * This function returns a validation result.
 */
export const validator: RuleValidator = (q): ValidationResult => {
  return {
    valid: q.value ? true : false,
    reasons: ["this field is always invalid"],
  };
};

export const isNotValid = (query: any) => {
  if (query.rules.length === 0) return true;

  return query.rules.find((rule: any) => {
    if (rule.rules) {
      return isNotValid(rule);
    }
    return rule.value ? false : true;
  });
};
