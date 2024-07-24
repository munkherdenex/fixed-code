import { Operator } from "react-querybuilder";

export const BASE_URL = `${(global?.window && window?.env?.BACKEND_URL) || ""}`;

export const PAGINATION_CHOOSES = [5, 10, 20, 50];

export const REACT_QUERY_BUILDER_OPERATORS: Operator[] = [
  { name: "=", label: "=" },
  { name: "!=", label: "!=" },
  { name: ">", label: ">" },
  { name: "<", label: "<" },
  { name: ">=", label: ">=" },
  { name: "<=", label: "<=" },
  { name: "contains", label: "contains" },
];
