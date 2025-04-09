import {
  EuiButton,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiTextArea,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { GetStaticProps } from "next/types";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import TemplateTable from "../../../../../components/crm/template/table";
import DashboardCRMLayout from "../../../../../layouts/dashboard_crm";
import useCreateCRMTemplate from "../../../../../hooks/useCreateCRMTemplate";
import { addToast } from "../../../../../components/toast";
import TicketTemplateEditor from '../../../../../components/ticket_template/editor';
import { NestedLayout } from '../layout';

const schema = yup
  .object({
    title: yup.string().required(""),
    description: yup.string(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const CreateTemplateFlyout = () => {
  const { trigger, isMutating } = useCreateCRMTemplate();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [newTemplate, setNewTemplate] = useState(null);

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
        title: "Successfully created",
        color: "success",
      });
      setNewTemplate(response);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <EuiButton key="sdf" onClick={() => setIsFlyoutVisible(true)}>
        Create template
      </EuiButton>
      {isFlyoutVisible && (
        <EuiFlyout
          ownFocus
          onClose={() => setIsFlyoutVisible(false)}
          aria-labelledby={simpleFlyoutTitleId}
          size={newTemplate ? "l": "s"}
        >
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2 id={simpleFlyoutTitleId}>Create template</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            { !newTemplate && <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
              <EuiFormRow
                label="Title"
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
                      placeholder="title"
                      aria-label="title"
                    />
                  )}
                />
              </EuiFormRow>
              <EuiFormRow
                label="Description"
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
                      placeholder="Description"
                      aria-label="Description"
                    />
                  )}
                />
              </EuiFormRow>
              <EuiFormRow>
                <EuiButton type="submit" isLoading={isMutating} fill>
                  Create
                </EuiButton>
              </EuiFormRow>
            </EuiForm> }
            {
              newTemplate && <TicketTemplateEditor initialTicketTemplate={newTemplate} />
            }
          </EuiFlyoutBody>
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
  console.log(__dirname)
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
