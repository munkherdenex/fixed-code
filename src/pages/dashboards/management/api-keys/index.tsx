import Head from "next/head";
import Sidebar from "../../../../components/management/sidebar";
import DashboardLayout from "../../../../layouts/dashboard";
import { EuiButton, EuiCallOut, EuiContextMenuItem, EuiCopy, EuiFieldText, EuiFlexItem, EuiFormRow, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiSpacer } from "@elastic/eui";
import { useState } from "react";
import ApiKeysTable from "../../../../components/api_keys/table";
import CreateAPIKeysComponent, { ApiKeyResponseDataType } from "../../../../components/api_keys/create_api_keys";

const ApiKeys = () => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [responseData, setResponseData] = useState<ApiKeyResponseDataType>();

  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Api keys",
          iconType: "managementApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => setIsFlyoutVisible(true)}
              fill
              key="create-api-key"
            >
              Create API Key
            </EuiButton>,
          ],
        }}
        sidebar={<Sidebar active="api-keys" />}
      >
        <div>
          <ApiKeysTable />
          {isFlyoutVisible && <CreateAPIKeysComponent setResponseData={setResponseData} setIsModalVisible={setIsModalVisible} setIsFlyoutVisible={setIsFlyoutVisible} />}
          {isModalVisible && (
            <EuiModal
              aria-labelledby='title'
              onClose={() => setIsModalVisible(false)}
            >
              <EuiModalHeader>
                <EuiModalHeaderTitle id='id'>
                  API Key
                </EuiModalHeaderTitle>
              </EuiModalHeader>
              <EuiModalBody>
                <div>
                  <EuiFormRow label="Key id">
                    <EuiFieldText readOnly value={responseData ? responseData?.kid : ''} />
                  </EuiFormRow>
                  <EuiSpacer size="m" />
                  <EuiFormRow label="Secret key">
                    <EuiFieldText
                      placeholder="Secret key"
                      aria-readonly
                      value={responseData ? responseData?.secret : ''}
                      append={
                        <EuiCopy textToCopy={responseData ? responseData?.secret : ''}>
                          {(copy) => (
                            <EuiContextMenuItem key="copy" icon="copy" onClick={copy} />
                          )}
                        </EuiCopy>
                      }
                      readOnly
                      aria-label="Use aria labels when no actual label is in use"
                    />
                  </EuiFormRow>
                  <EuiSpacer size="m" />
                  <EuiCallOut color="warning" iconType="warning">
                    <EuiFlexItem className="eui-textInheritColor" style={{ maxWidth: 390, fontSize: '13px' }}>  Please save this secret key somewhere safe and accessible. For security reasons, you won't be able to view it again through your Data UI. If you lose this secret key, you'll need to generate a new one.
                    </EuiFlexItem>
                  </EuiCallOut>
                </div>
              </EuiModalBody>
              <EuiModalFooter>
                <EuiButton onClick={() => setIsModalVisible(false)} fill>
                  Ok
                </EuiButton>
              </EuiModalFooter>
            </EuiModal>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};
export default ApiKeys;
