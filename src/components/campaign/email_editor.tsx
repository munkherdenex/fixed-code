import grapesjs, { Editor, Frame, ICommand, ProjectData } from "grapesjs";
import GjsEditor from "@grapesjs/react";
import { useEffect, useState } from "react";
import { EuiButton } from "@elastic/eui";
import "grapesjs/dist/css/grapes.min.css";
import plugin from "grapesjs-blocks-basic";

import { useCampaignContext } from "@/store/campaign_store";
import TestCampaignFlyout from "./test_campaign_flyout";
import { useTranslations } from "next-intl";
import { globalMutate } from '@/utils/globalMutate';
import mn from '@/messages/grapesjs_mn';

const swv = "sw-visibility";
const osm = "open-sm";
const otm = "open-tm";
const ola = "open-layers";
const obl = "open-blocks";
const ful = "fullscreen";
const prv = "preview";

const EmailEditor = () => {
  const translate = useTranslations();
  const [isViewEmail, setIsViewEmail] = useState(true);
  const [isTestLayout, setIsTestLayout] = useState(false);
  const { data } = useCampaignContext();
  const [editor, setEditor] = useState(null);
  const onEditor = (editor: Editor) => {
    setEditor(editor);
  };

  const closeFlyout = () => {
    setIsTestLayout(false);
  };

  const loadOnSave = () => {
    globalMutate("/api/v1/dj/templates/");
    setIsViewEmail(true);
  };

  useEffect(() => {
    if (editor != null) {
      editor.on('storage:store', loadOnSave);
  
      return () => {
        editor.off('storage:store', loadOnSave);
      }
    }
  }, [editor])

  return (
    <div>
      <EuiButton
        size="s"
        onClick={() => {
          if (isViewEmail) {
            setIsViewEmail(false);
          } else {
            editor.store();
          }
        }}
      >
        {isViewEmail ? "Засварлах" : "Хадгалах"}
      </EuiButton>
      &nbsp;
      <EuiButton
        size="s"
        onClick={() => {
          setIsTestLayout(true);
        }}
      >
        {translate("test")}
      </EuiButton>
      {isViewEmail && (
        <div
          css={{
            minHeight: "500px",
            marginTop: "20px",
            padding: "40px",
            width: "100%",
          }}>
          <iframe
            css={{
              border: 'none',
              height: "90vh",
              width: "100%",
            }}
            srcDoc={data?.body}
          />
        </div>
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
                  if (editor) {
                    const html = editor.getHtml();
                    const css = editor.getCss();
                    const fullHtml = `
                      <!DOCTYPE html>
                      <html lang="en">
                      <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${data.title}</title>
                        <style>${css}</style>
                      </head>
                      <body>
                        ${html}
                      </body>
                      </html>
                    `;
                    return { ...data, body: fullHtml, email_body: JSON.stringify(pData) };
                  }
                  return null;
                },
              },
              fromElement: true,
              plugins: [plugin],
              panels: {
                defaults: [
                  {
                    id: "options",
                    buttons: [
                      {
                        id: swv,
                        className: "fa fa-square-o",
                        command: "core:component-outline",
                        active: true,
                        context: swv,
                        attributes: { title: "View components" },
                      },
                      {
                        id: prv,
                        className: "fa fa-eye",
                        command: prv,
                        context: prv,
                        attributes: { title: "Preview" },
                      },
                      {
                        id: ful,
                        className: "fa fa-arrows-alt",
                        command: ful,
                        context: ful,
                        attributes: { title: "Fullscreen" },
                      }
                    ],
                  },
                  {
                    id: "views",
                    buttons: [
                      {
                        id: obl,
                        className: "fa fa-th-large",
                        command: obl,
                        active: true,
                        togglable: false,
                        attributes: { title: "Шинэ блок нэмэх" },
                      },
                      {
                        id: osm,
                        className: "fa fa-paint-brush",
                        command: osm,
                        togglable: false,
                        attributes: { title: "Загварын тохиргоо" },
                      },
                      {
                        id: ola,
                        className: "fa fa-bars",
                        command: ola,
                        togglable: false,
                        attributes: { title: "Сонгох" },
                      },
                      {
                        id: otm,
                        className: "fa fa-gear",
                        active: true,
                        command: otm,
                        togglable: false,
                      },
                    ],
                  },
                ],
              },
              i18n: {
                detectLocale: false,
              },
              projectData: JSON.parse(data?.email_body) || '',
            }}
          ></GjsEditor>
        </div>
      )}
      {isTestLayout && <TestCampaignFlyout closeFlyout={closeFlyout} />}
    </div>
  );
};

export default EmailEditor;
