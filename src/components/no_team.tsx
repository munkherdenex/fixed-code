import { EuiPageTemplate, EuiEmptyPrompt, EuiButton } from "@elastic/eui";
import { mutate } from "swr";
import useLogout from "../hooks/useLogout";

const NoTeam = () => {
  const { trigger } = useLogout();
  return (
    <EuiPageTemplate>
      <EuiPageTemplate.EmptyPrompt>
        <EuiEmptyPrompt
          body={
            <>
              <p>{"Админ эрхтэй хүнтэй холбоо барина уу."}</p>
              <EuiButton color="danger" onClick={async () => {
                await trigger();
                await mutate(() => true, undefined, { revalidate: false });
                localStorage.removeItem("currentTeamId");
                window.location.href = "/";
              }}>
                Гарах
              </EuiButton>
            </>
          }
          layout="vertical"
          title={<h2>Багт ороогүй байна</h2>}
          titleSize="m"
        />
      </EuiPageTemplate.EmptyPrompt>
    </EuiPageTemplate>
  );
};

export default NoTeam;
