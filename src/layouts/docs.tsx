import {
  EuiHeader,
  EuiHeaderLogo,
  useGeneratedHtmlId,
  EuiPageTemplate,
  EuiSideNav,
  htmlIdGenerator,
} from "@elastic/eui";
import ThemeSwitcher from "../components/chrome/theme_switcher";
import { docsLayout } from "./docs.styles";

const pathPrefix = process.env.PATH_PREFIX;

const DocsLayout = ({ pageHeader, children }) => {
  const sideNav = [
    {
      name: "Docs",
      id: htmlIdGenerator("campaignDocs")(),
      items: [
        {
          name: "Campaign",
          id: htmlIdGenerator("campaignDocs")(),
          href: `${pathPrefix}/docs`,
        },
      ],
    },
  ];

  const styles = docsLayout();

  return (
    <div css={styles.wrapper}>
      <EuiHeader
        theme="dark"
        position="fixed"
        sections={[
          {
            items: [
              <EuiHeaderLogo key="elastic-docs" iconType="logoElastic" href={`${pathPrefix}/`}>
                Elastic docs
              </EuiHeaderLogo>,
            ],
          },
          {
            items: [<ThemeSwitcher key={useGeneratedHtmlId()} />],
          },
        ]}
      />
      <EuiPageTemplate>
        <EuiPageTemplate.Header {...pageHeader} />
        <EuiPageTemplate.Sidebar sticky={true}>
          <EuiSideNav mobileTitle="Nav Items" items={sideNav} />
        </EuiPageTemplate.Sidebar>
        <EuiPageTemplate.Section>{children}</EuiPageTemplate.Section>
      </EuiPageTemplate>
    </div>
  );
};

export default DocsLayout;
