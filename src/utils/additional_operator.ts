/**
 * @description This file is used to add additional operators to the query builder.
 * */
export const additionalOperator = {
  $c: (field: string, _operator: string, value: any, _opts: any) => {
    return { field, operator: "contains", value: value };
  },
  $eq: (field: string, _operator: string, value: any, _opts: any) => {
    return { field, operator: "=", value: value };
  },
};
