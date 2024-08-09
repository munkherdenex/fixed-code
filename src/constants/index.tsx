import { Field, Operator } from "react-querybuilder";

export const BASE_URL = `${(global?.window && window?.env?.BACKEND_URL) || ""}`;
export const IS_POCKET = (global?.window && window?.env?.IS_POCKET) || false;

export const PAGINATION_CHOOSES = [5, 10, 20, 50];

export const REACT_QUERY_BUILDER_OPERATORS: Operator[] = [
  { name: "=", label: "=" },
  { name: "!=", label: "!=" },
  { name: ">", label: ">" },
  { name: "<", label: "<" },
  { name: "contains", label: "contains" },
];

export const QUERY_BUILDER_DEFAULT_FIELD: Field[] = [
  { name: "email", label: "Email", datatype: "str" },
  { name: "phone", label: "Phone", datatype: "int" },
  { name: "rid", label: "Reference id", datatype: "str" },
];

export const TEMPLATE_DATA_TYPE_OPTIONS = [
  { value: "email", inputDisplay: "Email" },
  { value: "sms", inputDisplay: "Sms" },
  { value: "push", inputDisplay: "Push" },
  { value: "inapp", inputDisplay: "Inapp", disabled: true },
  { value: "api", inputDisplay: "Api" },
];
