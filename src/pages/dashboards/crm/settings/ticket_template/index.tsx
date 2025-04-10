import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiTextArea,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { GetStaticProps } from "next/types";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import TemplateTable from "../../../../../components/crm/template/table";
import useCreateCRMTemplate from "../../../../../hooks/useCreateCRMTemplate";
import { addToast } from "../../../../../components/toast";
import TicketTemplateEditor from "../../../../../components/ticket_template/editor";
import { NestedLayout } from "../layout";
import ticketTemplateApi from "@/api/ticket_template";

const schema = yup
  .object({
    title: yup.string().required("Гарчиг шаардлагатай"),
    description: yup.string(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const CreateTemplateFlyout = () => {
  const { trigger, isMutating } = useCreateCRMTemplate();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [newTemplate, setNewTemplate] = useState(null);
  const [createdTemplate, setCreatedTemplate] = useState(null);
  const [fields, setFields] = useState([]);

  const simpleFlyoutTitleId = useGeneratedHtmlId();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger({
        name: data?.title,
        description: data?.description,
      });
      addToast({
        id: "success",
        title: "Амжилттай үүсгэлээ",
        color: "success",
      });
      setNewTemplate(response);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isFlyoutVisible) {
      setNewTemplate(null);
      setFields([]);
    }
  }, [isFlyoutVisible]);

  const handleSave = async () => {
    try {
      await ticketTemplateApi.update(createdTemplate.id, {
        name: createdTemplate.name,
        description: createdTemplate.description,
        has_priority: createdTemplate.has_priority,
        is_active: createdTemplate.is_active,
        fields: fields,
      });
      addToast({
        id: "success",
        title: "Амжилттай хадгаллаа",
        color: "success",
      });
    } catch (e) {
      addToast({
        id: "error",
        title: "Хадгалахад алдаа гарлаа",
        text: e.message,
        color: "danger",
      });
      console.error(e);
    }
    setIsFlyoutVisible(false);
  };

  return (
    <div>
      <EuiButton key="sdf" onClick={() => setIsFlyoutVisible(true)}>
        Загвар үүсгэх
      </EuiButton>
      {isFlyoutVisible && (
        <EuiFlyout
          ownFocus
          onClose={() => setIsFlyoutVisible(false)}
          aria-labelledby={simpleFlyoutTitleId}
          size={newTemplate ? "l" : "s"}
        >
          {!newTemplate && (
            <EuiFlyoutHeader hasBorder>
              <EuiTitle size="m">
                <h2 id={simpleFlyoutTitleId}>Загвар үүсгэх</h2>
              </EuiTitle>
            </EuiFlyoutHeader>
          )}
          <EuiFlyoutBody>
            {!newTemplate && (
              <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
                <EuiFormRow
                  label="Гарчиг"
                  isInvalid={!!errors.title?.message}
                  error={[errors.title?.message]}
                >
                  <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <EuiFieldText
                        onChange={onChange}
                        value={value}
                        onBlur={onBlur}
                        isInvalid={!!errors.title?.message}
                        placeholder="Гарчиг"
                        aria-label="Гарчиг"
                      />
                    )}
                  />
                </EuiFormRow>
                <EuiFormRow
                  label="Тайлбар"
                  isInvalid={!!errors.description?.message}
                  error={[errors.description?.message]}
                >
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <EuiTextArea
                        onChange={onChange}
                        value={value}
                        onBlur={onBlur}
                        isInvalid={!!errors.description?.message}
                        placeholder="Тайлбар"
                        aria-label="Тайлбар"
                      />
                    )}
                  />
                </EuiFormRow>
                <EuiFormRow>
                  <EuiButton type="submit" isLoading={isMutating} fill>
                    Үүсгэх
                  </EuiButton>
                </EuiFormRow>
              </EuiForm>
            )}
            {newTemplate && (
              <TicketTemplateEditor
                onChange={(updatedTemplateData, updatedItems) => {
                  setCreatedTemplate(updatedTemplateData);
                  setFields(updatedItems);
                }}
                initialTicketTemplate={newTemplate}
              />
            )}
          </EuiFlyoutBody>
          {newTemplate && (
            <EuiFlyoutFooter>
              <EuiFlexGroup justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty
                    iconType="cross"
                    onClick={() => {
                      setIsFlyoutVisible(false);
                    }}
                    flush="left"
                  >
                    Хаах
                  </EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton onClick={handleSave} fill>
                    Хадгалах
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlyoutFooter>
          )}
        </EuiFlyout>
      )}
    </div>
  );
};

const CRM = () => {
  return (
    <>
      <NestedLayout
        pageHeader={{
          pageTitle: "Тикетийн загвар",
          rightSideItems: [<CreateTemplateFlyout key="dfgaiogvao" />],
        }}
      >
        <div>
          <TemplateTable />
        </div>
      </NestedLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  console.log(__dirname);
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;
  const ticket = (await import(`../../../../../messages/${context.locale}/ticket.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...ticket,
      },
    },
  };
};

export default CRM;
