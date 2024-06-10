import Head from "next/head";
import { FunctionComponent, useState } from "react";
import DashboardLayout from "../../../../layouts/dashboard";
import { Field, QueryBuilder, RuleGroupType } from "react-querybuilder";

const fields: Field[] = [
  { name: "firstName", label: "First Name" },
  { name: "lastName", label: "Last Name" },
  { name: "age", label: "Age", inputType: "number" },
  { name: "address", label: "Address" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", validator: ({ value }) => /^[^@]+@[^@]+/.test(value) },
  { name: "twitter", label: "Twitter" },
  { name: "isDev", label: "Is a Developer?", valueEditorType: "checkbox", defaultValue: false },
];

const initialQuery: RuleGroupType = {
  combinator: "and",
  rules: [],
};

const Dashboard: FunctionComponent = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <>
      <Head>
        <title>Create segment</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Create segment",
          iconType: "dashboardApp",
        }}
      >
        <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
