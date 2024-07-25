import { Fields } from "../hooks/useGetFields";

export const processDynamicFieldData = (data: Fields[]) => {
  return Array.isArray(data)
    ? data.map((item) => ({
        name: `cf_${item.attribute_name}`,
        label: `CF ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`,
        datatype: item?.data_type,
      }))
    : [];
};
