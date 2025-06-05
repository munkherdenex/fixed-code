// @ts-nocheck

import DashboardCRMLayout from "@/layouts/dashboard_crm";
import { GetStaticProps } from "next/types";
import { useState, useEffect, useRef } from "react";
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
  // Add state for user's Facebook pages
  const [userFacebookPages, setUserFacebookPages] = useState<FacebookPage[]>([]);
  const [loadingUserPages, setLoadingUserPages] = useState(false);
  const [selectedUserPage, setSelectedUserPage] = useState<FacebookPage | null>(null);

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
          setFbLoginStatus(response);
          
          // If user is already connected, fetch their Facebook pages
          if (response.status === 'connected') {
            fetchUserFacebookPages(response.authResponse.accessToken);
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
        setFbLoginStatus(response);
        
        // If user is already connected, fetch their Facebook pages
        if (response.status === 'connected') {
          fetchUserFacebookPages(response.authResponse.accessToken);
        }
      });
    }
    
    return () => {
      document.removeEventListener('fb-sdk-ready', handleFBSDKReady);
    };
  }, []);

  // Handle login status change
  const statusChangeCallback = (response) => {
    console.log('Facebook login status changed:', response);
    setFbLoginStatus(response);
    
    // If we're now logged in, fetch user's Facebook pages
    if (response.status === 'connected') {
      fetchUserFacebookPages(response.authResponse.accessToken);
      fetchFacebookPages();
    } else {
      // Clear user Facebook pages if logged out
      setUserFacebookPages([]);
    }
  };

  // This function is called when the FB Login button completes its process
  const checkLoginState = () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
      });
    }
  };

  // Function to fetch the user's Facebook Pages
  const fetchUserFacebookPages = async (accessToken) => {
    setLoadingUserPages(true);
    try {
      if (typeof window !== 'undefined' && window.FB) {
        // Get pages the user manages with page access tokens
        window.FB.api(
          '/me/accounts',
          { fields: 'id,name,access_token,category,picture,tasks', access_token: accessToken },
          function(response) {
            if (response && !response.error) {
              console.log('User Facebook Pages:', response);
              setUserFacebookPages(response.data || []);
            } else {
              console.error('Error fetching user Facebook pages:', response?.error);
              setErrorMessage('Failed to fetch your Facebook pages. Please check permissions and try again.');
            }
            setLoadingUserPages(false);
          }
        );
      }
    } catch (error) {
      console.error('Error in fetchUserFacebookPages:', error);
      setErrorMessage('An error occurred while fetching your Facebook pages.');
      setLoadingUserPages(false);
    }
  };

  // Handle selecting a user Facebook page for import
  const handleSelectUserPage = (page: FacebookPage) => {
    setSelectedUserPage(page);
    
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
  }, []);

  // Fetch Facebook pages on component mount
  useEffect(() => {
    fetchFacebookPages();
  }, []);

  // Create a manual login function for a fallback button
  const handleManualLogin = () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.login(function(response) {
        statusChangeCallback(response);
      }, {scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_messaging'});
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
                <p>You are logged in to Facebook. You can now manage your Facebook pages.</p>
              </EuiCallOut>
              <EuiSpacer />
            </>
          )}

          {/* Display User's Facebook Pages section */}
          {fbLoginStatus && fbLoginStatus.status === 'connected' && (
            <>
              <EuiPanel>
                <EuiTitle size="s">
                  <h3>Your Facebook Pages</h3>
                </EuiTitle>
                <EuiHorizontalRule margin="s" />
                
                {loadingUserPages ? (
                  <EuiFlexGroup justifyContent="center" alignItems="center" style={{ height: "100px" }}>
                    <EuiLoadingSpinner size="m" />
                  </EuiFlexGroup>
                ) : userFacebookPages.length === 0 ? (
                  <EuiEmptyPrompt
                    iconType="facebookSquare"
                    title={<h3>No Facebook Pages Found</h3>}
                    body={
                      <p>
                        We couldn't find any Facebook pages that you manage. 
                        Please make sure you've granted the necessary permissions.
                      </p>
                    }
                  />
                ) : (
                  <EuiFlexGrid columns={3}>
                    {userFacebookPages.map((page) => (
                      <EuiFlexItem key={page.id}>
                        <EuiCard
                          textAlign="left"
                          title={page.name}
                          description={
                            <>
                              <p>Category: {page.category || 'Unknown'}</p>
                              <p>ID: {page.id}</p>
                              {page.tasks && (
                                <p>Roles: {page.tasks.join(', ')}</p>
                              )}
                            </>
                          }
                          image={
                            page.picture ? 
                              <div style={{ 
                                backgroundImage: `url(${page.picture.data.url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: '60px',
                                width: '60px',
                                borderRadius: '5px',
                                margin: '10px'
                              }} /> : 
                              <EuiIcon type="facebookSquare" size="xl" />
                          }
                          footer={
                            <EuiButton 
                              fullWidth 
                              size="s" 
                              onClick={() => handleSelectUserPage(page)}
                            >
                              Add to System
                            </EuiButton>
                          }
                        />
                      </EuiFlexItem>
                    ))}
                  </EuiFlexGrid>
                )}
              </EuiPanel>
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
                    You haven't added any Facebook pages to your system yet. 
                    Connect with Facebook and add the pages you want to manage.
                  </p>
                }
                actions={
                  fbLoginStatus && fbLoginStatus.status === 'connected' && userFacebookPages.length > 0 ? (
                    <p>Select a page from "Your Facebook Pages" section above to add it to your system.</p>
                  ) : (
                    <EuiButton 
                      color="primary" 
                      fill 
                      onClick={fbLoginStatus?.status === 'connected' ? addNewPage : handleManualLogin}
                      iconType={fbLoginStatus?.status === 'connected' ? "plusInCircle" : "facebookSquare"}
                    >
                      {fbLoginStatus?.status === 'connected' ? translate("add_page") : "Login with Facebook"}
                    </EuiButton>
                  )
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
