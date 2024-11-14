import { Moment } from "moment";
import { RuleGroupType, RuleValidator, ValidationResult } from "react-querybuilder";
import { RRule } from "rrule";
import { IS_POCKET } from "../constants";
import { Fields } from "../hooks/useGetFields";

export function isNumber(num: any) {
  if (typeof num === "number") {
    return num - num === 0;
  }
  if (typeof num === "string" && num.trim() !== "") {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
}

export const removeDeletedCustomFields = (data: Fields[], query: RuleGroupType) => {
  const fields = [
    ...(Array.isArray(data) ? data?.map((item) => `cf_${item.name}`) : []),
    "email",
    "phone",
    "rid",
  ];

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
  if (query?.rules?.length === 0) return true;

  return query?.rules?.find((rule: any) => {
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
      return "rid";
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

export function getDataKind(data: { kind: string; body: string }) {
  let kind = data?.kind;
  let body = data?.body;

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
}

export function getBodyContent(
  data: {
    body: string;
  },
  kind: string,
) {
  if (!IS_POCKET) return data?.body;
  if (IS_POCKET && kind === "email") return data?.body;
  try {
    const parsedBody = JSON.parse(data?.body);
    if (kind === "api") {
      return JSON.stringify(JSON.parse(data?.body), null, 2);
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
    return data?.body;
  }
}

export const rruleFreqSwitch = (freq: string) => {
  switch (freq) {
    case "HOURLY":
      return RRule.HOURLY;
    case "DAILY":
      return RRule.DAILY;
    case "WEEKLY":
      return RRule.WEEKLY;
    case "MONTHLY":
      return RRule.MONTHLY;
    case "YEARLY":
      return RRule.YEARLY;
    default:
      return RRule.WEEKLY;
  }
};

export const rruleWeekDaySwitch = (weekDays: string[]) => {
  const days = {
    monday: RRule.MO,
    tuesday: RRule.TU,
    wednesday: RRule.WE,
    thursday: RRule.TH,
    friday: RRule.FR,
    saturday: RRule.SA,
    sunday: RRule.SU,
  };

  return weekDays.map((day) => days[day]);
};

export const shorthenWeekDays = (weekDays: string[]) => {
  return weekDays.map((day) => day.slice(0, 2).toUpperCase());
};

export const extendWeekDays = (weekDays: string[]) => {
  const days = {
    MO: "monday",
    TU: "tuesday",
    WE: "wednesday",
    TH: "thursday",
    FR: "friday",
    SA: "saturday",
    SU: "sunday",
  };

  if (!weekDays) return [];

  return weekDays?.map((day) => days[day]);
};

export const getMonthDays = (selectedDays: Moment[]) => {
  if (!selectedDays) return [];

  return selectedDays.map((d) => d.date());
};
