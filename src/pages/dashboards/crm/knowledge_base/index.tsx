import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiText,
  EuiEmptyPrompt,
  EuiTitle,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiButtonGroup,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiTextArea,
  EuiConfirmModal,
  EuiCallOut,
} from "@elastic/eui";
import { useRouter } from "next/router";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import { GetStaticProps } from "next/types";
import dynamic from "next/dynamic";
import { useCallback, useState, useEffect, useRef } from "react";
import { OutputData } from "@editorjs/editorjs";
import PageTreeView from "@/components/custom_tree_view";
import knowledgeApi from "@/api/knowledge";

// Dynamically import the DocumentEditor component with SSR disabled
const DocumentEditor = dynamic(() => import("@/components/document_editor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const EDITOR_HOLDER_ID = "editorjs-container";

const KnowledgeManager = () => {
  // State management
  const [documentData, setDocumentData] = useState(undefined);
  const [originalDocumentData, setOriginalDocumentData] = useState(undefined); // Store original for cancel
  const [documentBody, setDocumentBody] = useState(undefined);
  const [originalDocumentBody, setOriginalDocumentBody] = useState(undefined); // Store original for cancel
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  // Check if there's any knowledge base data
  useEffect(() => {
    const checkForData = async () => {
      try {
        setIsLoading(true);
        const response = await knowledgeApi.getList({});
        setHasData(response && response.results && response.results.length > 0);
      } catch (error) {
        console.error("Error checking for knowledge base data:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForData();
  }, []);

  // Handle refresh from tree view
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Handle creating a new document
  const handleCreateNewDocument = useCallback(() => {
    const newDocument = {
      id: null,
      title: "Untitled Document",
      body: null,
      type: "public"
    };
    setDocumentData(newDocument);
    setOriginalDocumentData(newDocument);
    setDocumentBody(null);
    setOriginalDocumentBody(null);
    setSelectedItemId(null);
    setIsEditing(true);
    setHasData(true);
    setHasUnsavedChanges(false);
    setSaveError(null);
  }, []);

  // Handle document selection from tree
  const handleSelectDocument = useCallback((document) => {
    if (hasUnsavedChanges && isEditing) {
      // Show warning about unsaved changes
      setShowCancelModal(true);
      return;
    }

    if (document === null) {
      // Clear selection
      setDocumentData(null);
      setOriginalDocumentData(null);
      setDocumentBody(null);
      setOriginalDocumentBody(null);
      setSelectedItemId(null);
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setSaveError(null);
      return;
    }

    setDocumentData(document);
    setOriginalDocumentData(JSON.parse(JSON.stringify(document))); // Deep copy
    setDocumentBody(document.body);
    setOriginalDocumentBody(document.body ? JSON.parse(JSON.stringify(document.body)) : null);
    setSelectedItemId(document.id);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setSaveError(null);
  }, [hasUnsavedChanges, isEditing]);

  // Handle editor changes
  const handleEditorChange = useCallback((title: string, data: OutputData) => {
    setDocumentData(prev => prev ? { ...prev, title } : null);
    setDocumentBody(data);
    setHasUnsavedChanges(true);
  }, []);

  // Handle edit button click
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setSaveError(null);
  }, []);

  // Handle save button click
  const handleSave = useCallback(async () => {
    if (!documentData) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      const docToSave = {
        ...documentData,
        body: documentBody ? JSON.stringify(documentBody) : null
      };

      if (documentData.id) {
        // Update existing document
        await knowledgeApi.update(documentData.id, docToSave);
      } else {
        // Create new document
        const response = await knowledgeApi.create(docToSave);
        setDocumentData(prev => ({ ...prev, id: response.id }));
        setSelectedItemId(response.id);
      }

      // Update original data after successful save
      setOriginalDocumentData(JSON.parse(JSON.stringify(documentData)));
      setOriginalDocumentBody(documentBody ? JSON.parse(JSON.stringify(documentBody)) : null);
      
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error saving document:", error);
      setSaveError("Failed to save document. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [documentData, documentBody]);

  // Handle cancel button click
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowCancelModal(true);
    } else {
      setIsEditing(false);
    }
  }, [hasUnsavedChanges]);

  // Confirm cancel action
  const confirmCancel = useCallback(() => {
    // Restore original data
    setDocumentData(originalDocumentData);
    setDocumentBody(originalDocumentBody);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setShowCancelModal(false);
    setSaveError(null);
  }, [originalDocumentData, originalDocumentBody]);

  // Show loading spinner while checking for data
  if (isLoading) {
    return (
      <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: "400px" }}>
        <EuiFlexItem grow={false}>
          <EuiLoadingSpinner size="xl" />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }



  return (
    <>      
      <EuiFlexGroup>
        {/* Sidebar Panel */}
        <EuiFlexItem grow={false} css={{ backgroundColor: "#f5f5f5" }}>
          <EuiPanel 
            css={{ 
              minWidth: "330px", 
              height: "calc(100vh - 200px)",
              boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
              zIndex: 1
            }}
          >
            {/* Tree View */}
            <div style={{ overflow: "auto", height: "calc(100% - 80px)" }}>
              <PageTreeView
                onSelectItem={handleSelectDocument}
                selectedItemId={selectedItemId}
                refreshTrigger={refreshTrigger}
                onCreateNew={handleCreateNewDocument}
                onRefresh={handleRefresh}
              />
            </div>
          </EuiPanel>
        </EuiFlexItem>

        {/* Main Content Panel */}
        <EuiFlexItem>
          {hasData === false ? (
            // Show empty state when no documents exist
            <EuiEmptyPrompt
              icon={<EuiIcon type="documents" size="xl" />}
              title={<h2>Мэдлэгийн сан хоосон байна</h2>}
              body={
                <EuiText color="subdued">
                  <p>
                    Таны мэдлэгийн санд одоогоор ямар ч контент байхгүй байна. 
                    Эхний баримт бичгээ үүсгэж, багийнхантайгаа мэдлэг хуваалцаарай.
                  </p>
                  <p>
                    Энд та заавар, FAQ болон бусад дотооддоо хэрэгцээтэй мэдээллийг хадгалж,
                    зохион байгуулж болно.
                  </p>
                </EuiText>
              }
              actions={
                <EuiButton
                  fill
                  iconType="plus"
                  onClick={handleCreateNewDocument}
                  size="m"
                >
                  Анхны баримт бичгээ үүсгэх
                </EuiButton>
              }
              css={{
                maxWidth: "600px",
                margin: "0 auto",
                paddingTop: "80px",
              }}
            />
          ) : documentData ? (
            // Show unified document editor/viewer
            <div style={{ height: "calc(100vh - 200px)", overflow: "hidden" }}>
              <DocumentEditor
                key={documentData?.id || 'new-document'}
                initialTitle={documentData?.title}
                data={documentBody}
                isEditing={isEditing}
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSaving}
                saveError={saveError}
                documentData={documentData}
                onChange={handleEditorChange}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                holder={EDITOR_HOLDER_ID}
              />
            </div>
          ) : (
            // Show message when no document is selected
            <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: "400px" }}>
              <EuiFlexItem grow={false}>
                <EuiText textAlign="center" color="subdued">
                  <EuiIcon type="documents" size="xxl" style={{ marginBottom: "16px" }} />
                  <h3>Баримт бичиг сонгоно уу</h3>
                  <p>Зүүн талын жагсаалтаас баримт бичгээ сонгох эсвэл шинэ баримт үүсгэнэ үү.</p>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <EuiConfirmModal
          title="Хадгалагдаагүй өөрчлөлт"
          onCancel={() => setShowCancelModal(false)}
          onConfirm={confirmCancel}
          cancelButtonText="Үргэлжлүүлэх"
          confirmButtonText="Цуцлах"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          <p>
            Та хадгалагдаагүй өөрчлөлттэй байна. Хэрэв та цуцалбал энэ өөрчлөлтүүд алдагдах болно.
          </p>
        </EuiConfirmModal>
      )}
    </>
  );
};

const KnowledgeBase = () => {
  const router = useRouter();

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Мэдлэгийн сан",
        rightSideItems: [], // Remove the redundant create button
      }}
    >
      <>
        <KnowledgeManager />
      </>
    </DashboardCRMLayout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const knowledge = (await import(`../../../../messages/${context.locale}/knowledge.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...knowledge,
      },
    },
  };
};

export default KnowledgeBase;
