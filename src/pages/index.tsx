import { FunctionComponent } from "react";
import Head from "next/head";

const Index: FunctionComponent = () => {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
    </>
  );
};

export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: "/signin",
      permanent: true,
    },
  };
};

export default Index;
