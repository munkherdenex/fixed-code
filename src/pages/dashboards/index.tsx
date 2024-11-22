import { EuiCard, EuiFlexGroup, EuiFlexItem, EuiIcon } from "@elastic/eui";
import { useRouter } from "next/router";
import { useProductContext } from "../../store/products_store";
import { useContext } from "react";
import { teamsContext } from "../../store/teams_store";
import NoTeam from "../../components/no_team";
import DashboardHeadersSettings from "../../layouts/dashboard_headers_settings";

const defaultCard = {
  icon: "advancedSettingsApp",
  title: "Settings",
  description:
    "The settings are the configurations of your account. You can manage your profile, your team, and your preferences.",
  footer: "Go to segments",
  link: `/dashboards/settings`,
};

const Dashboards = () => {
  const router = useRouter();
  const { avialableProducts } = useProductContext();
  const { teams } = useContext(teamsContext);

  if (teams?.length === 0) {
    return (
      <>
        <DashboardHeadersSettings />
        <NoTeam />
      </>
    );
  }

  return (
    <EuiFlexGroup justifyContent="center" alignItems="center" gutterSize="l">
      {[...avialableProducts, defaultCard].map((card, index) => {
        return (
          <EuiFlexItem key={index}>
            <EuiCard
              icon={<EuiIcon size="xxl" type={card.icon} />}
              title={card.title}
              description={card.description}
              onClick={() => router.push(card.link)}
            />
          </EuiFlexItem>
        );
      })}
    </EuiFlexGroup>
  );
};

export default Dashboards;
