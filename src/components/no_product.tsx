import { EuiPageTemplate, EuiEmptyPrompt, EuiButton } from "@elastic/eui";
import { useRouter } from "next/router";

const NoProduct = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboards/settings/management");
  };

  return (
    <EuiPageTemplate>
      <EuiPageTemplate.EmptyPrompt>
        <EuiEmptyPrompt
          actions={[
            <EuiButton color="primary" fill onClick={handleClick} key="404-go-back">
              Go to settings
            </EuiButton>,
          ]}
          body={<p>This product has been disabled enable in settings or contact admin</p>}
          layout="vertical"
          title={<h2>Product disabled</h2>}
          titleSize="m"
        />
      </EuiPageTemplate.EmptyPrompt>
    </EuiPageTemplate>
  );
};

export default NoProduct;
