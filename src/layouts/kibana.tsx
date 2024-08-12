import { FunctionComponent } from "react";
import { kibanaLayoutStyles } from "./kibana.styles";
import { EuiPageTemplate, EuiPageTemplateProps, EuiPageHeaderProps } from "@elastic/eui";

interface KibanaLayoutProps extends EuiPageTemplateProps {
  pageHeader: EuiPageHeaderProps;
}

const KibanaLayout: FunctionComponent<KibanaLayoutProps> = ({ children, pageHeader, ...rest }) => {
  const styles = kibanaLayoutStyles();
  return (
    <div css={styles.mainWrapper}>
      <div css={styles.contentWrapper}>
        <EuiPageTemplate restrictWidth panelled={false} bottomBorder={true} {...rest}>
          <EuiPageTemplate.Header {...pageHeader} />
          <EuiPageTemplate.Section>{children}</EuiPageTemplate.Section>
        </EuiPageTemplate>
      </div>
    </div>
  );
};

export default KibanaLayout;
