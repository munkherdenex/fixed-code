import { Field, Operator } from "react-querybuilder";
import { FrontProduct } from "../store/products_store";
import { validator } from "../utils/helper";

export const BASE_URL = `${(global?.window && window?.env?.BACKEND_URL) || ""}`;
export const SOCKET_URL = `${(global?.window && window?.env?.SOCKET_URL) || ""}`;
export const IS_POCKET = (global?.window && window?.env?.IS_POCKET) || false;
export const IS_REGISTER_ENABLED = (global?.window && window?.env?.IS_REGISTER_ENABLED) || false;
export const CRM = (global?.window && window?.env?.CRM) || false;

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
  { value: "email", inputDisplay: "И-мэйл" },
  { value: "sms", inputDisplay: "СМС" },
  { value: "push", inputDisplay: "Push мэдэгдэл" },
  { value: "inapp", inputDisplay: "In-app мэдэгдэл", disabled: true },
  { value: "api", inputDisplay: "API" },
];

export const CAMPAIGN_CHANNEL_DATA_TYPE_OPTIONS = [
  { value: "email", text: "Email" },
  // { value: "sms", text: "Sms" },
  // { value: "push", text: "Push" },
  // { value: "inapp", text: "Inapp" },
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

export const TEAM_PRODUCTS: FrontProduct[] = [
  {
    name: "CDP",
    title: "CDP",
    description:
      "The audience is the group of people you want to reach with your campaign. A segment is a subset of your audience that you define based on specific criteria.",
    link: `/dashboards/cdp`,
    icon: "dashboardApp",
    selected: false,
  },
  {
    name: "CRM",
    title: "CRM",
    description:
      "The campaign is a marketing initiative that you want to send to your audience. It can be a newsletter, a promotion, or a survey.",
    link: `/dashboards/crm`,
    icon: "canvasApp",
    selected: false,
  },
  {
    name: "CRM-Ticket",
    title: "CRM-Ticket",
    description:
      "The campaign is a marketing initiative that you want to send to your audience. It can be a newsletter, a promotion, or a survey.",
    link: `/dashboards/crm`,
    icon: "canvasApp",
    selected: false,
  },

  {
    name: "CRM-Call",
    title: "CRM-Call",
    description:
      "The campaign is a marketing initiative that you want to send to your audience. It can be a newsletter, a promotion, or a survey.",
    link: `/dashboards/crm`,
    icon: "canvasApp",
    selected: false,
  },

  {
    name: "CRM-Chat",
    title: "CRM-Chat",
    description:
      "The campaign is a marketing initiative that you want to send to your audience. It can be a newsletter, a promotion, or a survey.",
    link: `/dashboards/crm`,
    icon: "canvasApp",
    selected: false,
  },
];
