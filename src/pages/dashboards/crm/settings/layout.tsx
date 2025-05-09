// import Layout from '../components/layout'
// import NestedLayout from '../components/nested-layout'

import DashboardCRMLayout from "@/layouts/dashboard_crm";
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSideNav } from "@elastic/eui";
import { css } from "@emotion/react";
import { useRouter } from "next/router";

const  NestedLayout = ({ children, pageHeader, rightSideItem }: { children: React.ReactNode; pageHeader?: any, rightSideItem? : any }) => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <DashboardCRMLayout pageHeader={pageHeader} rightSideItem={rightSideItem}>
      <EuiFlexGroup>
        <EuiFlexItem grow={0}>
          <EuiPanel color="subdued" hasBorder>
            <EuiSideNav
              css={css`
                @media (min-width: 1000px) {
                  min-height: 500px;
                  min-width: 180px;
                }
              `}
              items={[
                {
                  name: "Тохиргоо",
                  id: "settings",
                  items: [
                    {
                      name: "Тикетийн категори",
                      id: "templates",
                      href: "/dashboards/crm/settings/ticket_template",
                      isSelected: currentPath == "/dashboards/crm/settings/ticket_template",
                    },
                    {
                      name: "Чухлын зэрэг",
                      id: "integrations",
                      href: "/dashboards/crm/settings/ticket_priority",
                      isSelected: currentPath == "/dashboards/crm/settings/ticket_priority",
                    },
                    {
                      name: "Тикетийн төрөл",
                      id: "integrations",
                      href: "/dashboards/crm/settings/ticket_tags",
                      isSelected: currentPath == "/dashboards/crm/settings/ticket_tags",
                    },
                  ],
                },
              ]}
            />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>{children}</EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </DashboardCRMLayout>
  );
}

export default NestedLayout;