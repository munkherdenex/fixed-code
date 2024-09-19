import EditEmailLayout from "./edit_email_layout";
import { useCampaignContext } from "../../store/campaign_store";
import GeneralDetails from "./general_detail";
import { getDataKind } from "../../utils/helper";

const CampaignPreviewContainer = () => {
  const { data } = useCampaignContext();

  const dataKind = getDataKind(data);

  if (dataKind === "email") {
    return (
      <>
        <EditEmailLayout />
      </>
    );
  }

  return <GeneralDetails />;
};

export default CampaignPreviewContainer;
