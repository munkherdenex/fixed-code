import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiText,
  EuiTreeView,
} from "@elastic/eui";
import { useRouter } from "next/router";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import { GetStaticProps } from "next/types";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { OutputData } from "@editorjs/editorjs";
import PageTreeView from "@/components/editor_tree_view";
import knowledgeApi from "@/api/knowledge";

// Dynamically import the Editor component with SSR disabled
const Editor = dynamic(() => import("../../../../components/editor"), {
  ssr: false, // Ensure Editor.js runs only on the client-side
  loading: () => <p>Loading editor...</p>, // Optional loading state
});

const EDITOR_HOLDER_ID = "editorjs-container"; // Define a unique ID for the editor holder

const KnowledgeManager = () => {
  // State to hold the editor's data
  const [documentData, setDocumentData] = useState(undefined); // Start with undefined or initial data
  const [documentBody, setDocumentBody] = useState(undefined); // Start with undefined or initial data
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Memoize the onChange handler to prevent unnecessary re-renders of the Editor component
  const handleEditorChange = useCallback((title: string, data: OutputData) => {
    console.log("Editor data changed: ", documentData, title, data != null);
    // setDocumentData({
    //   ...documentData,
    //   body: data,
    // })
    knowledgeApi.update(documentData.id, { ...documentData, title:title, type: "public", body: JSON.stringify(data) });
    setDocumentBody(data);
    // Here you could implement auto-saving logic, e.g., debounce saving to an API
  }, [documentData]);

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} css={{ backgroundColor: "#f5f5f5" }}>
          <EuiPanel css={{ minWidth: "330px" }}>
            <PageTreeView
              onSelectItem={(s) => {
                console.log(s);
                setDocumentData(s);
                setDocumentBody(s.body);
                setSelectedItemId(s.id);
              }}
              selectedItemId={selectedItemId}
            />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText>
            <Editor
              initialTitle={documentData?.title}
              data={documentBody} // Pass current data (can be initial data)
              onChange={handleEditorChange} // Pass the handler function
              holder={EDITOR_HOLDER_ID} // Pass the unique ID
            />
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

const KnowledgeBase = () => {
  const router = useRouter();

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Мэдлэгийн сан",
        rightSideItems: [
          <EuiButton key="sdf" onClick={() => router.push("/dashboards/crm/knowledge_base/create")}>
            Үүсгэх
          </EuiButton>,
        ],
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
