import { Field, Operator } from "react-querybuilder";
import { validator } from "../utils/helper";

export const BASE_URL = `${(global?.window && window?.env?.BACKEND_URL) || ""}`;
export const IS_POCKET = (global?.window && window?.env?.IS_POCKET) || false;
export const IS_REGISTER_ENABLED = (global?.window && window?.env?.IS_REGISTER_ENABLED) || false;

export const PAGINATION_CHOOSES = [5, 10, 20, 50];

export const REACT_QUERY_BUILDER_OPERATORS: Operator[] = [
  { name: "=", label: "=" },
  { name: "!=", label: "!=" },
  { name: ">", label: ">" },
  { name: "<", label: "<" },
  { name: "contains", label: "contains" },
];

export const QUERY_BUILDER_DEFAULT_FIELD: Field[] = [
  { name: "email", label: "Email", datatype: "str", inputType: "str", validator },
  { name: "phone", label: "Phone", datatype: "int", inputType: "int", validator },
  { name: "rid", label: "Reference id", datatype: "str", inputType: "str", validator },
];

export const TEMPLATE_DATA_TYPE_OPTIONS = [
  { value: "email", inputDisplay: "Email" },
  { value: "sms", inputDisplay: "Sms" },
  { value: "push", inputDisplay: "Push" },
  { value: "inapp", inputDisplay: "Inapp", disabled: true },
  { value: "api", inputDisplay: "Api" },
];

export const CAMPAIGN_CHANNEL_DATA_TYPE_OPTIONS = [
  { value: "email", text: "Email" },
  { value: "sms", text: "Sms" },
  { value: "push", text: "Push" },
  { value: "inapp", text: "Inapp" },
  { value: "api", text: "Api" },
];

export const CUSTOM_DATA_TYPE_OPTIONS = [
  { value: "int", text: "Int" },
  { value: "str", text: "String" },
  { value: "datetime", text: "Date time" },
  { value: "bool", text: "Boolean" },
  { value: "date", text: "Date" },
];

export const CUSTOMER_SEGMENT_DATA_TYPE_OPTIONS = [
  { value: "customer", text: "Customer" },
  { value: "segment", text: "Segment" },
];

export const EMAIL_PHONE_DATA_TYPE_OPTIONS = [
  { value: "email", text: "Email" },
  { value: "phone", text: "Phone" },
];
