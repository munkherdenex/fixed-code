import { EuiPageTemplate, EuiEmptyPrompt } from "@elastic/eui";

const UnderConstruction = () => {
  return (
    <EuiPageTemplate>
      <EuiPageTemplate.EmptyPrompt>
        <EuiEmptyPrompt
          body={<p>This product is under construction</p>}
          layout="vertical"
          title={<h2>Under construction</h2>}
          titleSize="m"
        />
      </EuiPageTemplate.EmptyPrompt>
    </EuiPageTemplate>
  );
};

export default UnderConstruction;
