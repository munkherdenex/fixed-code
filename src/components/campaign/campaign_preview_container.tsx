import { useCampaignContext } from "../../store/campaign_store";
import GeneralDetails from "./general_detail";
import { getDataKind } from "../../utils/helper";
import EmailEditor from './email_editor';

const CampaignPreviewContainer = () => {
  const { data } = useCampaignContext();

  const dataKind = getDataKind(data);

  if (dataKind === "email") {
    return <EmailEditor />;
  }

  return <GeneralDetails />;
};

export default CampaignPreviewContainer;
