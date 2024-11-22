import { EuiButtonIcon, EuiPopover, EuiKeyPadMenu, EuiKeyPadMenuItem, EuiIcon } from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";

const products = [
  {
    id: "cdp",
    label: "CDP",
    icon: "dashboardApp",
    link: "/dashboards/cdp",
  },
  {
    id: "crm",
    label: "CRM",
    icon: "canvasApp",
    link: "/dashboards/crm",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "managementApp",
    link: "/dashboards/settings",
  },
];

const ChangeProductButton = () => {
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const button = (
    <EuiButtonIcon size="s" color="text" iconType="apps" onClick={onButtonClick}>
      Data dashboard
    </EuiButtonIcon>
  );

  return (
    <EuiPopover button={button} isOpen={isPopoverOpen} closePopover={closePopover}>
      <div>
        <EuiKeyPadMenu style={{ width: "100%" }}>
          {products.map((product) => (
            <EuiKeyPadMenuItem
              key={product.id}
              label={product.label}
              isSelected={router.pathname.startsWith(product.link)}
              onClick={() => router.push(`${product.link}`)}
            >
              <EuiIcon type={product.icon} size="l" />
            </EuiKeyPadMenuItem>
          ))}
        </EuiKeyPadMenu>
      </div>
    </EuiPopover>
  );
};

export default ChangeProductButton;
