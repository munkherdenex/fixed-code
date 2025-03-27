import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPanel, EuiText, EuiTreeView } from "@elastic/eui";
import { useRouter } from "next/router";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import { GetStaticProps } from "next/types";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { OutputData } from "@editorjs/editorjs";
import PageTreeView from '@/components/editor_tree_view';

// Dynamically import the Editor component with SSR disabled
const Editor = dynamic(() => import("../../../../components/editor"), {
  ssr: false, // Ensure Editor.js runs only on the client-side
  loading: () => <p>Loading editor...</p>, // Optional loading state
});

const EDITOR_HOLDER_ID = "editorjs-container"; // Define a unique ID for the editor holder

const KnowledgeManager = () => {
  // State to hold the editor's data
  const [editorData, setEditorData] = useState<OutputData | undefined>(undefined); // Start with undefined or initial data

  // Memoize the onChange handler to prevent unnecessary re-renders of the Editor component
  const handleEditorChange = useCallback((data: OutputData) => {
    console.log("Editor data changed: ", data);
    setEditorData(data);
    // Here you could implement auto-saving logic, e.g., debounce saving to an API
  }, []);

  const handleSave = () => {
    if (editorData) {
      console.log("Saving data:", editorData);
      // --- Send 'editorData' to your backend API here ---
      // Example:
      // fetch('/api/posts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editorData),
      // })
      // .then(response => response.json())
      // .then(savedPost => console.log('Post saved:', savedPost))
      // .catch(error => console.error('Error saving post:', error));
      alert("Data saved! Check the console."); // Placeholder
    } else {
      console.log("No data to save.");
    }
  };

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} css={{ backgroundColor: "#f5f5f5" }}>
          <EuiPanel css={{ minWidth: '330px' }}>
            <PageTreeView />
          </EuiPanel>
          <EuiPanel css={{ minWidth: '230px' }}>
            <EuiTreeView
              items={[
                {
                  label: "Item One",
                  id: "item_one",
                  icon: <EuiIcon type="arrowRight" />,
                  iconWhenExpanded: <EuiIcon type="arrowDown" />,
                  isExpanded: true,
                  children: [
                    {
                      label: "Item A",
                      id: "item_a",
                      icon: <EuiIcon type="document" />,
                    },
                    {
                      label: "Item B",
                      id: "item_b",
                      icon: <EuiIcon type="document" />,
                    },
                  ],
                },
                {
                  label: "Item Two",
                  id: "item_two",
                },
              ]}
              aria-label="Sample Tree View"
            />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText>
            <Editor
              data={editorData} // Pass current data (can be initial data)
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
