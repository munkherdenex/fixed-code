// @ts-nocheck

import DashboardCRMLayout from "@/layouts/dashboard_crm";
import { GetStaticProps } from "next/types";
import { useState, useEffect } from "react";
import {
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiIcon,
  EuiButtonEmpty,
  EuiButton,
  EuiPanel,
  EuiText,
  EuiSpacer,
  EuiButtonIcon,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiSwitch,
  EuiLoadingSpinner,
  EuiBadge,
  EuiFieldPassword,
  EuiCallOut,
} from "@elastic/eui";
import { useTranslations } from "next-intl";
import fbPageConfigApi, { FBPageConfig } from "@/api/fb_page_config";
import { useRouter } from "next/router";

const ChatFacebook = () => {
  const translate = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState<FBPageConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facebookPages, setFacebookPages] = useState<FBPageConfig[]>([]);

  // Fetch Facebook pages on component mount
  useEffect(() => {
    fetchFacebookPages();
  }, []);

  const fetchFacebookPages = async () => {
    setIsLoading(true);
    try {
      const data = await fbPageConfigApi.getList();
      setFacebookPages(data.results || []);
      setErrorMessage(null);
    } catch (error) {
      console.error("Failed to fetch Facebook pages:", error);
      setErrorMessage("Failed to load Facebook pages. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const addNewPage = () => {
    setCurrentPage({
      page_id: "",
      page_name: "",
      page_access_token: "",
      app_id: "",
      app_secret: "",
      verify_token: "",
      status: "active",
      is_enabled: true,
    });
    setErrorMessage(null);
    setIsModalVisible(true);
  };

  const editPage = (page: FBPageConfig) => {
    setCurrentPage({ ...page });
    setErrorMessage(null);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setCurrentPage(null);
    setErrorMessage(null);
  };

  const handleInputChange = (field: keyof FBPageConfig, value: string | boolean) => {
    if (currentPage) {
      setCurrentPage({
        ...currentPage,
        [field]: value,
      });
    }
  };

  const handleSavePage = async () => {
    if (!currentPage) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (currentPage.id) {
        // Update existing page
        await fbPageConfigApi.update(currentPage.id, currentPage);
      } else {
        // Add new page
        await fbPageConfigApi.create(currentPage);
      }

      // Refresh the page list
      await fetchFacebookPages();
      closeModal();
    } catch (error: any) {
      console.error("Error saving Facebook page:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to save Facebook page. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePage = async (id: number) => {
    if (confirm(translate("confirm_delete"))) {
      setIsLoading(true);
      try {
        await fbPageConfigApi.delete(id);
        await fetchFacebookPages();
      } catch (error) {
        console.error("Error deleting Facebook page:", error);
        setErrorMessage("Failed to delete Facebook page. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePageStatus = async (id: number, isEnabled: boolean) => {
    try {
      await fbPageConfigApi.toggleActive(id, isEnabled);
      await fetchFacebookPages();
    } catch (error) {
      console.error("Error toggling Facebook page status:", error);
      setErrorMessage("Failed to update page status. Please try again.");
    }
  };

  const renderEditModal = () => {
    if (!currentPage) return null;

    return (
      <EuiModal onClose={closeModal} initialFocus="[name=page_name]">
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            {currentPage.id ? translate("edit_facebook_page") : translate("add_facebook_page")}
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          {errorMessage && (
            <>
              <EuiCallOut title="Error" color="danger">
                <p>{errorMessage}</p>
              </EuiCallOut>
              <EuiSpacer />
            </>
          )}

          <EuiForm>
            <EuiFormRow label={translate("page_name")}>
              <EuiFieldText
                name="page_name"
                value={currentPage.page_name || ""}
                onChange={(e) => handleInputChange("page_name", e.target.value)}
              />
            </EuiFormRow>

            <EuiFormRow label={translate("facebook_page_id")}>
              <EuiFieldText
                name="page_id"
                value={currentPage.page_id}
                onChange={(e) => handleInputChange("page_id", e.target.value)}
              />
            </EuiFormRow>

            <EuiFormRow label={translate("page_access_token")}>
              <EuiFieldPassword
                name="page_access_token"
                value={currentPage.page_access_token}
                onChange={(e) => handleInputChange("page_access_token", e.target.value)}
              />
            </EuiFormRow>

            <EuiFormRow label={translate("app_id")}>
              <EuiFieldText
                name="app_id"
                value={currentPage.app_id || ""}
                onChange={(e) => handleInputChange("app_id", e.target.value)}
              />
            </EuiFormRow>

            <EuiFormRow label={translate("app_secret")} isRequired>
              <EuiFieldPassword
                type="dual"
                name="app_secret"
                value={currentPage.app_secret}
                onChange={(e) => handleInputChange("app_secret", e.target.value)}
              />
            </EuiFormRow>

            <EuiFormRow label={translate("verify_token")}>
              <EuiFieldText
                name="verify_token"
                value={currentPage.verify_token || ""}
                onChange={(e) => handleInputChange("verify_token", e.target.value)}
              />
            </EuiFormRow>

            <EuiFormRow hasChildLabel={false}>
              <EuiSwitch
                label={translate("active")}
                checked={currentPage.is_enabled}
                onChange={(e) => handleInputChange("is_enabled", e.target.checked)}
              />
            </EuiFormRow>
          </EuiForm>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={closeModal} disabled={isSubmitting}>
            {translate("cancel")}
          </EuiButtonEmpty>

          <EuiButton fill onClick={handleSavePage} isLoading={isSubmitting}>
            {translate("save")}
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  };

  return (
    <>
      <DashboardCRMLayout
        pageHeader={{
          pageTitle: "Чатны тохиргоо",
        }}
        rightSideItem={
          <EuiButton onClick={addNewPage} iconType="plusInCircle" fill>
            {translate("add_page")}
          </EuiButton>
        }
      >
        <>
          {errorMessage && (
            <>
              <EuiCallOut title="Error" color="danger">
                <p>{errorMessage}</p>
              </EuiCallOut>
              <EuiSpacer />
            </>
          )}

          {isLoading ? (
            <EuiFlexGroup justifyContent="center" alignItems="center" style={{ height: "200px" }}>
              <EuiLoadingSpinner size="xl" />
            </EuiFlexGroup>
          ) : facebookPages.length === 0 ? (
            <EuiText textAlign="center" color="subdued">
              <p>{translate("no_facebook_pages")}</p>
            </EuiText>
          ) : (
            <EuiFlexGrid columns={3}>
              {facebookPages.map((page) => (
                <EuiFlexItem key={page.id}>
                  <EuiCard
                    title={page.page_name || "Unnamed Page"}
                    description={
                      <>
                        <p>ID: {page.page_id}</p>
                        <p>
                          Status:{" "}
                          <EuiBadge color={page.is_enabled ? "success" : "danger"}>
                            {page.is_enabled ? translate("active") : translate("inactive")}
                          </EuiBadge>
                        </p>
                      </>
                    }
                    footer={
                      <EuiFlexGroup justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <EuiSwitch
                            label={translate("active")}
                            checked={page.is_enabled}
                            onChange={() => page.id && togglePageStatus(page.id, !page.is_enabled)}
                          />
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiButtonIcon
                            aria-label={translate("edit")}
                            iconType="pencil"
                            onClick={() => editPage(page)}
                          />
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiButtonIcon
                            aria-label={translate("delete")}
                            iconType="trash"
                            color="danger"
                            onClick={() => page.id && handleDeletePage(page.id)}
                          />
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    }
                  />
                </EuiFlexItem>
              ))}
            </EuiFlexGrid>
          )}
        </>
      </DashboardCRMLayout>

      {isModalVisible && renderEditModal()}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  console.log(__dirname);
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const chat = (await import(`../../../../messages/${context.locale}/chat.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...chat,
      },
    },
  };
};

export default ChatFacebook;
