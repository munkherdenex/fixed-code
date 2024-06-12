import Head from "next/head";
import DashboardLayout from "../../../../layouts/dashboard";

const Create = () => {
  return (
    <>
      <Head>
        <title>Create send</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Create send",
          iconType: "spacesApp",
          description: "Create sends.",
        }}
      >
        <div>create</div>
      </DashboardLayout>
    </>
  );
};

export default Create;
