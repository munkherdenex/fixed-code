import grapesjs, { Editor, ProjectData } from "grapesjs";
import GjsEditor from "@grapesjs/react";
import { useState } from "react";
import { EuiButton } from "@elastic/eui";
import "grapesjs/dist/css/grapes.min.css";
import plugin from "grapesjs-blocks-basic";

import { useCampaignContext } from "@/store/campaign_store";

const swv = 'sw-visibility';
const expt = 'export-template';
const osm = 'open-sm';
const otm = 'open-tm';
const ola = 'open-layers';
const obl = 'open-blocks';
const ful = 'fullscreen';
const prv = 'preview';

const EmailEditor = () => {
  const [isViewEmail, setIsViewEmail] = useState(true);
  const { data } = useCampaignContext();
  const [editor, setEditor] = useState(null);
  const onEditor = (editor: Editor) => {
    console.log("Editor loaded", { editor });
    setEditor(editor);
  };

  let editorData = {};
  try {
    editorData = JSON.parse(data?.email_body);
  } catch {
    editorData = {};
  }

  return (
    <div>
      <EuiButton onClick={() => {
        if (isViewEmail) {
          setIsViewEmail(false)
        } else {
          editor.store();
          setIsViewEmail(true)
        }
      }}>
        {isViewEmail ? "Засварлах" : "Хадгалах"}
      </EuiButton>
      {isViewEmail && (
        <div
          css={{
            minHeight: "500px",
            overflow: "auto",
            padding: "40px",
            border: "1px dashed #ccc",
            marginTop: "20px",
          }}
          dangerouslySetInnerHTML={{ __html: data?.body }}
        />
      )}
      {!isViewEmail && (
        <div
          css={{
            minHeight: "500px",
            overflow: "auto",
            border: "1px dashed #ccc",
            marginTop: "20px",
          }}
        >
          <GjsEditor
            grapesjs={grapesjs}
            onEditor={onEditor}
            options={{
              height: "80vh",
              storageManager: {
                autosave: false,
                type: "remote",
                options: {
                  remote: {
                    urlStore: `/api/v1/dj/templates/${data?.id}/`,
                    fetchOptions: (init) => {
                      init.method = "put";
                      return init;
                    },
                  },
                },
                onStore: (pData: ProjectData, editor: Editor) => {
                  const canvas = editor.Canvas.getCanvasView();
                  if (canvas) {
                    const bodyHtml = canvas.getFrameView().getBody().innerHTML;
                    console.log("hml", bodyHtml);
                    console.log("dat", pData);
                    return { ...data, body: bodyHtml, email_body: JSON.stringify(pData) };
                  }
                  return null;
                },
              },
              fromElement: true,
              plugins: [plugin],
              panels: {
                defaults: [
                  {
                    id: 'commands',
                    buttons: [{
                      id: 'myButton',
                      label: 'My button',
                    }, {
                      id: 'resize',
                      label: 'Resize',
                    }],
                  },
                  {
                    id: 'options',
                    buttons: [
                      {
                        active: true,
                        id: swv,
                        className: 'fa fa-square-o',
                        command: 'core:component-outline',
                        context: swv,
                        attributes: { title: 'View components' },
                      },
                      {
                        id: prv,
                        className: 'fa fa-eye',
                        command: prv,
                        context: prv,
                        attributes: { title: 'Preview' },
                      },
                      {
                        id: ful,
                        className: 'fa fa-arrows-alt',
                        command: ful,
                        context: ful,
                        attributes: { title: 'Fullscreen' },
                      },
                      {
                        id: expt,
                        className: 'fa fa-code',
                        command: expt,
                        attributes: { title: 'View code' },
                      },
                    ],
                  },
                  {
                    id: 'views',
                    buttons: [
                      {
                        id: obl,
                        className: 'fa fa-th-large',
                        command: obl,
                        active: true,
                        togglable: false,
                        attributes: { title: 'Open Blocks' },
                      },
                      {
                        id: osm,
                        className: 'fa fa-paint-brush',
                        command: osm,
                        togglable: false,
                        attributes: { title: 'Open Style Manager' },
                      },
                      {
                        id: ola,
                        className: 'fa fa-bars',
                        command: ola,
                        togglable: false,
                        attributes: { title: 'Open Layer Manager' },
                      },
                    ],
                  },
                ],
              },
              projectData: editorData,
            }}
          >
          </GjsEditor>
        </div>
      )}
    </div>
  );
};

export default EmailEditor;
