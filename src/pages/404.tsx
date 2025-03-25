import { FunctionComponent } from "react";
import { EuiButton, EuiEmptyPrompt, EuiPageTemplate, EuiImage } from "@elastic/eui";
import { useTheme } from "../components/theme";
import { useRouter } from "next/router";

const NotFoundPage: FunctionComponent = () => {
  const { colorMode } = useTheme();

  const isDarkTheme = colorMode === "dark";

  const illustration = isDarkTheme
    ? "/images/404_rainy_cloud_dark.png"
    : "/images/404_rainy_cloud_light.png";

  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    router.back();
  };

  return (
    <EuiPageTemplate>
      <EuiPageTemplate.EmptyPrompt>
        <EuiEmptyPrompt
          actions={[
            <EuiButton color="primary" fill onClick={handleClick} key="404-go-back">
              Буцах
            </EuiButton>,
          ]}
          body={
            <p>
              Энэ хуудас 404 алдааг харуулна.
            </p>
          }
          icon={<EuiImage alt="" size="fullWidth" src={illustration} />}
          layout="vertical"
          title={<h2>Мэдээлэл олдсонгүй</h2>}
          titleSize="m"
        />
      </EuiPageTemplate.EmptyPrompt>
    </EuiPageTemplate>
  );
};

export default NotFoundPage;
