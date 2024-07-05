const operatorsMap: { [key: string]: any } = {
  ">": "$gt",
  ">=": "$gte",
  "<": "$lt",
  "<=": "$lte",
  "=": "$eq",
  "!=": "$ne",
  contains: (value: string) => ({ $regex: `.*${value}.*` }),
  beginsWith: (value: string) => ({ $regex: `^${value}` }),
  endsWith: (value: string) => ({ $regex: `${value}$` }),
  doesNotContain: (value: string) => ({ $not: { $regex: `.*${value}.*` } }),
  doesNotBeginWith: (value: string) => ({ $not: { $regex: `^${value}` } }),
  doesNotEndWith: (value: string) => ({ $not: { $regex: `${value}$` } }),
  null: () => ({ $eq: null }),
  notNull: () => ({ $ne: null }),
  in: (value: any[]) => ({ $in: value }),
  notIn: (value: any[]) => ({ $nin: value }),
  between: (value: [any, any]) => ({ $gte: value[0], $lte: value[1] }),
  notBetween: (value: [any, any]) => ({ $not: { $gte: value[0], $lte: value[1] } }),
};

const mongoToJsonOperatorsMap: { [key: string]: string } = {
  $gt: ">",
  $gte: ">=",
  $lt: "<",
  $lte: "<=",
  $eq: "=",
  $ne: "!=",
  $regex: "contains",
  $in: "in",
  $nin: "notIn",
  $not: "not",
};

const reverseOperatorsMap: { [key: string]: (field: string, value: any) => any } = {
  contains: (field: string, value: any) => ({
    field,
    operator: "contains",
    value: value.$regex.replace(/.*(.*).*/, "$1"),
  }),
  beginsWith: (field: string, value: any) => ({
    field,
    operator: "beginsWith",
    value: value.$regex.replace(/^\^(.*)/, "$1"),
  }),
  endsWith: (field: string, value: any) => ({
    field,
    operator: "endsWith",
    value: value.$regex.replace(/(.*)\$$/, "$1"),
  }),
  doesNotContain: (field: string, value: any) => ({
    field,
    operator: "doesNotContain",
    value: value.$not.$regex.replace(/.*(.*).*/, "$1"),
  }),
  doesNotBeginWith: (field: string, value: any) => ({
    field,
    operator: "doesNotBeginWith",
    value: value.$not.$regex.replace(/^\^(.*)/, "$1"),
  }),
  doesNotEndWith: (field: string, value: any) => ({
    field,
    operator: "doesNotEndWith",
    value: value.$not.$regex.replace(/(.*)\$$/, "$1"),
  }),
  null: (field: string) => ({ field, operator: "null", value: null }),
  notNull: (field: string) => ({ field, operator: "notNull", value: null }),
  in: (field: string, value: any) => ({ field, operator: "in", value: value.$in }),
  notIn: (field: string, value: any) => ({ field, operator: "notIn", value: value.$nin }),
  between: (field: string, value: any) => ({
    field,
    operator: "between",
    value: [value.$gte, value.$lte],
  }),
  notBetween: (field: string, value: any) => ({
    field,
    operator: "notBetween",
    value: [value.$not.$gte, value.$not.$lte],
  }),
};

const validCombinators = ["and", "or"];
const validMongoCombinators = ["$and", "$or"];

export const convertToMongoQuery = (json: any): string => {
  if (!json || typeof json !== "object" || !json.combinator || !Array.isArray(json.rules)) {
    throw new Error("Invalid input: json must have 'combinator' and 'rules' properties");
  }

  if (!validCombinators.includes(json.combinator)) {
    throw new Error(`Invalid combinator: ${json.combinator}`);
  }

  const processRules = (rules: any[]): any[] =>
    rules.map((rule) => {
      if (rule.combinator && Array.isArray(rule.rules)) {
        if (!validCombinators.includes(rule.combinator)) {
          throw new Error(`Invalid combinator in sub-rule: ${rule.combinator}`);
        }
        return { ["$" + rule.combinator]: processRules(rule.rules) };
      }

      if (!rule.field || !rule.operator || rule.value === undefined) {
        throw new Error(
          "Invalid rule: each rule must have 'field', 'operator', and 'value' properties",
        );
      }

      const operatorFunc = operatorsMap[rule.operator];
      if (!operatorFunc) {
        throw new Error(`Unsupported operator: ${rule.operator}`);
      }

      const condition: { [key: string]: any } = {};
      condition[rule.field] =
        typeof operatorFunc === "function"
          ? operatorFunc(rule.value)
          : { [operatorFunc]: rule.value };

      return condition;
    });

  return JSON.stringify({ ["$" + json.combinator]: processRules(json.rules) });
};

export const convertMongoQueryToJson = (mongoQuery: any): any => {
  const processMongoRules = (query: any): any[] => {
    const rules: any[] = [];

    for (const key in query) {
      if (validMongoCombinators.includes(key)) {
        query[key].forEach((condition: any) => {
          const conditionKeys = Object.keys(condition);

          if (validMongoCombinators.some((comb) => conditionKeys.includes(comb))) {
            rules.push({
              combinator: key.substring(1),
              rules: processMongoRules(condition),
            });
          } else {
            const field = conditionKeys[0];
            const operatorKey = Object.keys(condition[field])[0];
            const value = condition[field][operatorKey];

            if (operatorKey in reverseOperatorsMap) {
              rules.push(reverseOperatorsMap[operatorKey](field, condition[field]));
            } else if (operatorKey in mongoToJsonOperatorsMap) {
              rules.push({
                field,
                operator: mongoToJsonOperatorsMap[operatorKey],
                value,
              });
            } else {
              throw new Error(`Unsupported operator in condition: ${JSON.stringify(condition)}`);
            }
          }
        });
      }
    }

    return rules;
  };

  const combinator = validMongoCombinators.find((comb) => comb in mongoQuery);
  if (!combinator) {
    throw new Error(`Invalid combinator in query: ${JSON.stringify(mongoQuery)}`);
  }

  return {
    combinator: combinator.substring(1),
    rules: processMongoRules(mongoQuery),
  };
};
