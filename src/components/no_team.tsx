import { EuiPageTemplate, EuiEmptyPrompt } from "@elastic/eui";

const NoTeam = () => {
  return (
    <EuiPageTemplate>
      <EuiPageTemplate.EmptyPrompt>
        <EuiEmptyPrompt
          body={<p>{"Please contact your admin"}</p>}
          layout="vertical"
          title={<h2>No permission</h2>}
          titleSize="m"
        />
      </EuiPageTemplate.EmptyPrompt>
    </EuiPageTemplate>
  );
};

export default NoTeam;
