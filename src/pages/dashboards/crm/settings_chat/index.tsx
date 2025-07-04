// @ts-nocheck

import DashboardCRMLayout from "@/layouts/dashboard_crm";
import { GetStaticProps } from "next/types";
import { useState, useEffect, useRef, useCallback } from "react";
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
  EuiCode,
  EuiEmptyPrompt,
  EuiTitle,
  EuiHorizontalRule,
} from "@elastic/eui";
import { useTranslations } from "next-intl";
import fbPageConfigApi, { FBPageConfig } from "@/api/fb_page_config";
import { useRouter } from "next/router";
import FacebookSDK from '@/components/facebook_script';

interface FacebookPage {
  id: string;
  name: string;
  category: string;
  access_token?: string;
  tasks?: string[];
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

const ChatFacebook = () => {
  const translate = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState<FBPageConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facebookPages, setFacebookPages] = useState<FBPageConfig[]>([]);
  const [fbSDKReady, setFbSDKReady] = useState(false);
  const [fbLoginStatus, setFbLoginStatus] = useState<any>(null);
  const fbButtonContainerRef = useRef(null);
  const [loadingUserPages, setLoadingUserPages] = useState(false);

  // Setup Facebook SDK ready listener
  useEffect(() => {
    const handleFBSDKReady = () => {
      console.log('FB SDK Ready event received');
      setFbSDKReady(true);
      // Try to parse XFBML again once SDK is ready
      if (typeof window !== 'undefined' && window.FB) {
        window.FB.XFBML.parse();
        // Check login status
        window.FB.getLoginStatus(function(response) {
          console.log('FB Login Status:', response);          
          if (response.status === 'connected') {
            setFbLoginStatus(response);
          }
        });
      }
    };

    // Listen for custom event from FacebookSDK component
    document.addEventListener('fb-sdk-ready', handleFBSDKReady);

    // Also check if FB SDK is already loaded
    if (typeof window !== 'undefined' && window.FB) {
      setFbSDKReady(true);
      window.FB.getLoginStatus(function(response) {
        console.log('FB Login Status (direct):', response);
        // If user is already connected, fetch their Facebook pages from backend
        if (response.status === 'connected') {
          setFbLoginStatus(response);
        }
      });
    }
    
    return () => {
      document.removeEventListener('fb-sdk-ready', handleFBSDKReady);
    };
  }, []);

  // Handle login status change
  const statusChangeCallback = useCallback((response) => {
    console.log('Facebook login status changed:', response);
    setFbLoginStatus(response);
    
    // If we're now logged in, fetch user's Facebook pages from backend
    if (response.status === 'connected') {
      fetchUserFacebookPagesFromBackend(response.authResponse.accessToken, response.authResponse.userID);
      fetchFacebookPages();
    } else {
      // Clear user Facebook pages if logged out
      setFacebookPages([]);
    }
  }, []);

  // This function is called when the FB Login button completes its process
  const checkLoginState = useCallback(() => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
      });
    }
  }, [statusChangeCallback]);

  // Function to fetch the user's Facebook Pages from backend
  const fetchUserFacebookPagesFromBackend = async (accessToken: string, userID: string) => {
    setLoadingUserPages(true);
    try {
      const response = await fbPageConfigApi.saveConfig({
        user_access_token: accessToken,
        app_scoped_user_id: userID
      });
      setFacebookPages(response.data || []);
    } catch (error) {
      console.error('Error fetching user Facebook pages from backend:', error);
      setErrorMessage('Failed to fetch your Facebook pages from server. Please try again.');
    } finally {
      setLoadingUserPages(false);
    }
  };

  // Handle selecting a user Facebook page for import
  const handleSelectUserPage = (page: FacebookPage) => {
    // Pre-populate the form with the selected page data
    setCurrentPage({
      page_id: page.id,
      page_name: page.name,
      page_access_token: page.access_token || "",
      app_id: "", // This will need to be filled by the user
      app_secret: "", // This will need to be filled by the user
      verify_token: "", // This might need to be generated
      status: "active",
      is_enabled: true,
    });
    
    setErrorMessage(null);
    setIsModalVisible(true);
  };

  // Make sure FB button is rerendered when SDK is ready
  useEffect(() => {
    if (fbSDKReady && typeof window !== 'undefined' && window.FB && fbButtonContainerRef.current) {
      console.log('Parsing XFBML for FB button container');
      window.FB.XFBML.parse(fbButtonContainerRef.current);
    }
  }, [fbSDKReady]);
  
  // Make checkLoginState available globally for the FB Login Button
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.checkLoginState = checkLoginState;
    }
    
    return () => {
      // Clean up when component unmounts
      if (typeof window !== 'undefined') {
        // @ts-ignore
        delete window.checkLoginState;
      }
    };
  }, [checkLoginState]);

  // Fetch Facebook pages on component mount
  useEffect(() => {
    fetchFacebookPages();
  }, []);

  // Create a manual login function for a fallback button
  const handleManualLogin = () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.login(function(response) {
        statusChangeCallback(response);
      }, {scope: 'public_profile,pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging,business_management'});
    } else {
      console.error('Facebook SDK not loaded');
      setErrorMessage('Facebook SDK is not loaded. Please refresh the page and try again.');
    }
  };

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
          <FacebookSDK />
          {errorMessage && (
            <>
              <EuiCallOut title="Error" color="danger">
                <p>{errorMessage}</p>
              </EuiCallOut>
              <EuiSpacer />
            </>
          )}

          {/* Facebook Login Section */}
          {(!fbLoginStatus || fbLoginStatus.status !== 'connected') && (
            <>
              <EuiCallOut 
                title="Facebook Login Required" 
                color="primary"
                iconType="iInCircle"
              >
                <p>Please log in with Facebook to access and manage your Facebook pages:</p>
                <EuiSpacer size="m" />
                
                {/* Facebook Login Button Container */}
                <div ref={fbButtonContainerRef} style={{ minHeight: '40px' }}>
                  <div className="fb-login-button"
                    data-width=""
                    data-size="large"
                    data-button-type="login_with"
                    data-layout="default"
                    data-auto-logout-link="false"
                    data-use-continue-as="false"
                    data-scope="public_profile,email,pages_show_list,pages_read_engagement,pages_manage_metadata"
                    data-onlogin="checkLoginState">
                  </div>
                </div>
                
                {/* Fallback button in case the Facebook button doesn't render */}
                <EuiSpacer size="s" />
                <p>If the Facebook login button is not visible, please use this button instead:</p>
                <EuiButton 
                  onClick={handleManualLogin}
                  iconType="logoFacebook"
                  color="primary"
                >
                  Login with Facebook
                </EuiButton>
              </EuiCallOut>
              <EuiSpacer />
            </>
          )}
          
          {fbLoginStatus && fbLoginStatus.status === 'connected' && (
            <>
              <EuiCallOut 
                title="Connected to Facebook" 
                color="success"
                iconType="checkInCircleFilled"
              >
                <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                  <EuiFlexItem>
                    <p>Та Facebook-ээ холбож удирдах Page-уудын эрхээ олгосон байна.</p>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton 
                      size="s"
                      iconType="refresh"
                      onClick={handleManualLogin}
                    >
                      Шинээр холбох
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiCallOut>
              <EuiSpacer />
            </>
          )}
          
          {/* Existing System Pages Section */}
          <EuiPanel>
            <EuiTitle size="s">
              <h3>Configured Facebook Pages</h3>
            </EuiTitle>
            <EuiHorizontalRule margin="s" />
            
            {isLoading ? (
              <EuiFlexGroup justifyContent="center" alignItems="center" style={{ height: "200px" }}>
                <EuiLoadingSpinner size="xl" />
              </EuiFlexGroup>
            ) : facebookPages.length === 0 ? (
              <EuiEmptyPrompt
                iconType="facebookSquare"
                title={<h3>{translate("no_facebook_pages")}</h3>}
                body={
                  <p>
                    You haven&apos;t added any Facebook pages to your system yet. 
                    Connect with Facebook and add the pages you want to manage.
                  </p>
                }
                actions={(
                  <EuiButton 
                    color="primary" 
                    fill 
                    onClick={fbLoginStatus?.status === 'connected' ? addNewPage : handleManualLogin}
                    iconType={fbLoginStatus?.status === 'connected' ? "plusInCircle" : "facebookSquare"}
                  >
                    {fbLoginStatus?.status === 'connected' ? translate("add_page") : "Login with Facebook"}
                  </EuiButton>)
                }
              />
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
          </EuiPanel>
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
