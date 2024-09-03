import {
  EuiBreadcrumbs,
  EuiButton,
  EuiCard,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiPanel,
  EuiTextArea,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import Head from "next/head";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import Dynamic from "../../../../components/segments/dynamic";
import Manual from "../../../../components/segments/manual";
import useCreateSegmentDynamic from "../../../../hooks/useCreateSegmentDynamic";
import useCreateSegmentManualFile from "../../../../hooks/useCreateSegmentManualFile";
import useCreateSegmentManualText from "../../../../hooks/useCreateSegmentManualText";
import DashboardLayout from "../../../../layouts/dashboard";

const pathPrefix = process.env.PATH_PREFIX;

const schema = yup.object({
  name: yup.string().required().label("Name"),
  description: yup.string().label("Description"),
});

type MyFormData = yup.InferType<typeof schema>;

const Dashboard: FunctionComponent = () => {
  const router = useRouter();
  const { trigger: createSegmentDynamic, isMutating: isCreateSegmentDynamicMutating } =
    useCreateSegmentDynamic();
  const { trigger: createSegmentFile, isMutating: isCreateSegmentFileMutating } =
    useCreateSegmentManualFile();
  const { trigger: createSegmentText, isMutating: isCreateSegmentMutating } =
    useCreateSegmentManualText();

  const [firstFormData, setFirstFormData] = useState<MyFormData | null>(null);
  const [selectedCard, setCard] = useState(2);
  const [openFlyout, setOpenFlyout] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const flyoutTitleId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const cardClicked = (number: number) => {
    setCard(number);
  };

  const addSubscriber = (data: MyFormData) => {
    setFirstFormData(data);
    setOpenFlyout(true);
  };

  const createSegment = async (data) => {
    const type = selectedCard === 1 ? "static" : selectedCard === 2 ? "dynamic" : "manual";
    try {
      if (type === "dynamic") {
        const dynamicResponse = await createSegmentDynamic({
          name: firstFormData.name,
          description: firstFormData.description,
          type: type,
          ...data,
        });

        if (dynamicResponse) {
          router.push("/dashboards/segments");
        }
      }
      if (type === "manual") {
        if (data.input_type === "file") {
          const formData = new FormData();
          formData.append("name", firstFormData.name);
          formData.append("description", firstFormData.description);
          formData.append("type", type);
          formData.append("file", data.file[0]);

          const fileResponse = await createSegmentFile(formData);

          if (fileResponse) {
            router.push("/dashboards/segments");
          }
        }
        if (data.input_type === "text") {
          const textResponse = await createSegmentText({
            name: firstFormData.name,
            description: firstFormData.description,
            type: type,
            ...data,
          });

          if (textResponse) {
            router.push("/dashboards/segments");
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Head>
        <title>Create segment</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Create segment",
          iconType: "dashboardApp",
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push(`${pathPrefix}/dashboards`),
              },
              {
                text: "Segments",
                onClick: () => router.push(`${pathPrefix}/dashboards/segments`),
              },
              {
                text: "Create segment",
              },
            ]}
            truncate={false}
          />
        }
      >
        <>
          <EuiPanel>
            <EuiForm component="form" onSubmit={handleSubmit(addSubscriber)}>
              <EuiFlexGroup direction="column">
                <EuiFlexItem>
                  <EuiFormRow
                    label="Name"
                    isInvalid={!!errors.name?.message}
                    error={[errors.name?.message]}
                  >
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, onBlur, value, name } }) => (
                        <EuiFieldText
                          onChange={onChange}
                          value={value}
                          onBlur={onBlur}
                          placeholder={name}
                          fullWidth
                          isInvalid={!!errors.name?.message}
                        />
                      )}
                    />
                  </EuiFormRow>
                  <EuiFormRow label="Description">
                    <Controller
                      control={control}
                      name="description"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <EuiTextArea
                          onChange={onChange}
                          value={value}
                          onBlur={onBlur}
                          placeholder="Placeholder text"
                          name="description"
                          aria-label="Use aria labels when no actual label is in use"
                        />
                      )}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup gutterSize="l">
                    <EuiFlexItem>
                      <EuiCard
                        icon={<EuiIcon size="xxl" type="sqlApp" />}
                        title="Dynamic"
                        description="Create a dynamic segment based on a query."
                        selectable={{
                          onClick: () => cardClicked(2),
                          isSelected: selectedCard === 2,
                        }}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiCard
                        icon={<EuiIcon size="xxl" type="notebookApp" />}
                        title="Manual"
                        description="Create a manual segment based on a file and text."
                        selectable={{
                          onClick: () => cardClicked(3),
                          isSelected: selectedCard === 3,
                        }}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiButton type="submit">Add segment</EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiForm>
          </EuiPanel>
          {openFlyout && (
            <EuiFlyout onClose={() => setOpenFlyout(false)}>
              <EuiFlyoutHeader hasBorder aria-labelledby={flyoutTitleId}>
                <EuiTitle>
                  <h2 id={flyoutTitleId}>
                    {selectedCard === 1 && "Static"} {selectedCard === 2 && "Dynamic"}{" "}
                    {selectedCard === 3 && "Manual"}
                  </h2>
                </EuiTitle>
              </EuiFlyoutHeader>
              <EuiFlyoutBody>
                {selectedCard === 2 && (
                  <Dynamic
                    createSegment={createSegment}
                    isCreateSegmentMutating={
                      isCreateSegmentDynamicMutating ||
                      isCreateSegmentFileMutating ||
                      isCreateSegmentMutating
                    }
                  />
                )}
                {selectedCard === 3 && (
                  <Manual
                    createSegment={createSegment}
                    isCreateSegmentMutating={
                      isCreateSegmentDynamicMutating ||
                      isCreateSegmentFileMutating ||
                      isCreateSegmentMutating
                    }
                  />
                )}
              </EuiFlyoutBody>
            </EuiFlyout>
          )}
        </>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
