import { useRouter } from "next/router";
import { useEffect } from "react";

const NoPermission = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboards");
  }, [router]);

  return <></>;

  // return (
  //   <EuiPageTemplate>
  //     <EuiPageTemplate.EmptyPrompt>
  //       <EuiEmptyPrompt
  //         actions={[
  //           <EuiButton color="primary" fill onClick={handleClick} key="404-go-back">
  //             Go back
  //           </EuiButton>,
  //         ]}
  //         body={<p>{message || "You don't have permission to view this page"}</p>}
  //         layout="vertical"
  //         title={<h2>No permission</h2>}
  //         titleSize="m"
  //       />
  //     </EuiPageTemplate.EmptyPrompt>
  //   </EuiPageTemplate>
  // );
};

export default NoPermission;
