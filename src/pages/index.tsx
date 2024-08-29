import { FunctionComponent } from "react";
import Head from "next/head";
import Wrapper from "../components/starter/wrapper";

const Index: FunctionComponent = () => {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <Wrapper>
        <h1>Welcome to cdp</h1>
      </Wrapper>
    </>
  );
};

export default Index;
