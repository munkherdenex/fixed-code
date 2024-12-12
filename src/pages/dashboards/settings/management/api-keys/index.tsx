import {
  EuiButton,
  EuiCallOut,
  EuiContextMenuItem,
  EuiCopy,
  EuiFieldText,
  EuiFlexItem,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
} from "@elastic/eui";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { GetStaticProps } from "next/types";
import { useState } from "react";
import CreateAPIKeysComponent, {
  ApiKeyResponseDataType,
} from "../../../../../components/api_keys/create_api_keys";
import ApiKeysTable from "../../../../../components/api_keys/table";
import DashboardSettings from "../../../../../layouts/dashboard_settings";
import { ApiKeyProvider } from "../../../../../store/api_key_store";

const CreateFlyout = ({
  isFlyoutVisible,
  setIsFlyoutVisible,
}: {
  isFlyoutVisible: boolean;
  setIsFlyoutVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const translate = useTranslations();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [responseData, setResponseData] = useState<ApiKeyResponseDataType>();

  return (
    <>
      {isFlyoutVisible && (
        <CreateAPIKeysComponent
          setResponseData={setResponseData}
          setIsModalVisible={setIsModalVisible}
          setIsFlyoutVisible={setIsFlyoutVisible}
        />
      )}
      {isModalVisible && (
        <EuiModal aria-labelledby="title" onClose={() => setIsModalVisible(false)}>
          <EuiModalHeader>
            <EuiModalHeaderTitle id="id">{translate("api_key_created")}</EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <div>
              <EuiFormRow label={translate("key_id")}>
                <EuiFieldText
                  readOnly
                  value={responseData ? responseData?.kid : ""}
                  append={
                    <EuiCopy textToCopy={responseData ? responseData?.kid : ""}>
                      {(copy) => (
                        <EuiFlexItem className="eui-textInheritColor" style={{ maxWidth: 38 }}>
                          <EuiContextMenuItem key="copy" icon="copy" onClick={copy} />
                        </EuiFlexItem>
                      )}
                    </EuiCopy>
                  }
                />
              </EuiFormRow>
              <EuiSpacer size="m" />
              <EuiFormRow label={translate("secret_key")}>
                <EuiFieldText
                  placeholder={translate("secret_key")}
                  aria-readonly
                  value={responseData ? responseData?.secret : ""}
                  append={
                    <EuiCopy className="" textToCopy={responseData ? responseData?.secret : ""}>
                      {(copy) => (
                        <EuiFlexItem className="eui-textInheritColor" style={{ maxWidth: 38 }}>
                          <EuiContextMenuItem key="copy" icon="copy" onClick={copy} />
                        </EuiFlexItem>
                      )}
                    </EuiCopy>
                  }
                  readOnly
                  aria-label="Use aria labels when no actual label is in use"
                />
              </EuiFormRow>
              <EuiSpacer size="m" />
              <EuiCallOut color="warning" iconType="warning">
                <EuiFlexItem
                  className="eui-textInheritColor"
                  style={{ maxWidth: 390, fontSize: "13px" }}
                >
                  {translate("create_api_text")}
                </EuiFlexItem>
              </EuiCallOut>
            </div>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButton onClick={() => setIsModalVisible(false)} fill>
              {translate("ok")}
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      )}
    </>
  );
};

const ApiKeys = () => {
  const translate = useTranslations();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  return (
    <>
      <Head>
        <title>{translate("api_keys")}</title>
      </Head>
      <ApiKeyProvider>
        <DashboardSettings
          pageHeader={{
            pageTitle: translate("api_keys"),
            iconType: "managementApp",
            rightSideItems: [
              <EuiButton
                color="primary"
                onClick={() => setIsFlyoutVisible(true)}
                fill
                key="create-api-key"
              >
                {translate("create_api_keys")}
              </EuiButton>,
            ],
          }}
        >
          <div>
            <ApiKeysTable />
            <CreateFlyout
              isFlyoutVisible={isFlyoutVisible}
              setIsFlyoutVisible={setIsFlyoutVisible}
            />
          </div>
        </DashboardSettings>
      </ApiKeyProvider>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const keys = (await import(`../../../../../messages/${context.locale}/keys.json`)).default;
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...keys,
        ...common,
      },
    },
  };
};

export default ApiKeys;
