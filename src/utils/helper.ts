import { jsonrepair } from "jsonrepair";
import { RuleGroupType, RuleValidator, ValidationResult } from "react-querybuilder";
import { IS_POCKET } from "../constants";
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

export const dataTypeSwitch = <T extends string>(dataType: T) => {
  if (!IS_POCKET) return dataType;
  //TODO: If team is not pocket return just kind
  switch (dataType) {
    case "sms":
      return "api";
    case "push":
      return "api";
    default:
      return dataType;
  }
};

export const dataTypeToSwitch = (dataType: string) => {
  if (!IS_POCKET) return dataType;
  switch (dataType) {
    case "sms":
      return "phone";
    case "email":
      return "email";
    case "push":
      return "device_id";
    default:
      return dataType;
  }
};

export const processKind = (body: string, kind: any): any => {
  if (!IS_POCKET) return kind;
  if (IS_POCKET && kind === "email") return kind;
  try {
    const parsedBody = JSON.parse(body);
    if (parsedBody.type === "sms") {
      return "sms";
    }
    if (parsedBody.type === "push") {
      return "push";
    }
  } catch (error) {
    return kind;
  }

  return kind;
};

export const processBody = (body: string, kind: string) => {
  if (!IS_POCKET) return body;
  if (IS_POCKET && kind === "email") return body;
  try {
    const parsedBody = JSON.parse(body);
    if (kind === "api") {
      return JSON.stringify(JSON.parse(body), null, 2);
    }
    if (kind === "sms") {
      return parsedBody.body;
    }
    if (kind === "email") {
      return parsedBody.body;
    }
    if (kind === "push") {
      return parsedBody.body;
    }
  } catch (error) {
    return body;
  }
};

export function getDataKind(data) {
  let dataKind = data?.kind;

  if (IS_POCKET && data?.kind === "api") {
    try {
      const parsedBody = JSON.parse(jsonrepair(data?.body || "{}"));
      dataKind = parsedBody?.type || data?.kind;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      // Optionally, you can handle parsing errors and return a default value
    }
  }

  return dataKind;
}

export function getBodyContent(data, dataKind: string) {
  if (IS_POCKET && dataKind !== "email") {
    try {
      const repairedData = JSON.parse(jsonrepair(data?.body || "{}"));
      return repairedData?.body || null; // Safeguard in case body is missing
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null; // Return null or a fallback value in case of parsing error
    }
  }

  return data?.body || null; // Default to original body if no conditions met
}
