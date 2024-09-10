import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import useGetTemplates, { Template } from "../../hooks/useGetTemplates";
import {
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiToolTip,
} from "@elastic/eui";
import Button from "../next_eui/button";
import TestEmailLayout from "./test_email_layout";
import { IS_POCKET } from "../../constants";
import { jsonrepair } from "jsonrepair";

const ViewEmailLayout = ({
  templateStatus,
  setView,
}: {
  templateStatus?: "DRAFT" | "APPROVED" | "PUBLISHED" | "DONE" | "ERROR";
  setView?: (res: boolean) => void;
}) => {
  const router = useRouter();
  const { data } = useGetTemplates<Template>(
    router.query.id,
    {},
    {
      refreshInterval: templateStatus !== "DRAFT" ? 1000 : 0,
    },
  );
  const ReactQuill = useMemo(() => dynamic(() => import("react-quill"), { ssr: false }), []);

  var toolbarOptions = "";
  const [isTestLayout, setIsTestLayout] = useState(false);
  const module = {
    toolbar: toolbarOptions,
  };
  const closeFlyout = () => {
    setIsTestLayout(false);
  };

  const dataBody = IS_POCKET ? JSON.parse(jsonrepair(data?.body || "{}")).body : data?.body;

  return (
    <>
      <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiFormRow label="Subject">
            <EuiFieldText value={data?.title} readOnly placeholder="Subject" aria-label="Subject" />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup gutterSize="xl" alignItems="flexEnd" justifyContent="flexEnd">
            <EuiToolTip position="top" content="send test function on Email campaign">
              <EuiFlexItem grow={false}>
                <Button
                  size="s"
                  onClick={() => {
                    setIsTestLayout(true);
                  }}
                >
                  Test
                </Button>
              </EuiFlexItem>
            </EuiToolTip>

            {(data.status === "DRAFT" || data.status === "ERROR") && (
              <EuiToolTip position="top" content="move to the update screen">
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon
                    display={"base"}
                    iconType="documentEdit"
                    size="s"
                    onClick={() => {
                      setView(false);
                    }}
                  />
                </EuiFlexItem>
              </EuiToolTip>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <ReactQuill modules={module} theme="snow" value={dataBody} readOnly />
      {isTestLayout && <TestEmailLayout closeFlyout={closeFlyout} template_data={data} />}
    </>
  );
};

export default ViewEmailLayout;
