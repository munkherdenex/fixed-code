import { EuiPageTemplate, EuiEmptyPrompt } from "@elastic/eui";
import Wrapper from "../../components/starter/wrapper";

const VerifyError = () => {
  return (
    <Wrapper>
      <>
        <EuiPageTemplate.EmptyPrompt>
          <EuiEmptyPrompt
            body={<p>{"This confirm is already used"}</p>}
            layout="vertical"
            title={<h2>Used confirm</h2>}
            titleSize="m"
          />
        </EuiPageTemplate.EmptyPrompt>
      </>
    </Wrapper>
  );
};

export default VerifyError;
