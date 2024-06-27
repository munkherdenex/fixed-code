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
import Static from "../../../../components/segments/static";
import useCreateSegment from "../../../../hooks/useCreateSegment";
import DashboardLayout from "../../../../layouts/dashboard";

const pathPrefix = process.env.PATH_PREFIX;

const schema = yup.object({
  name: yup.string().required("please enter your name"),
  description: yup.string(),
});

type FormData = yup.InferType<typeof schema>;

const Dashboard: FunctionComponent = () => {
  const router = useRouter();
  const { trigger, isMutating: isCreateSegmentMutating } = useCreateSegment();
  const [firstFormData, setFirstFormData] = useState<FormData | null>(null);
  const [selectedCard, setCard] = useState(1);
  const [openFlyout, setOpenFlyout] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const flyoutTitleId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const cardClicked = (number: number) => {
    setCard(number);
  };

  const addSubscriber = (data: FormData) => {
    setFirstFormData(data);
    setOpenFlyout(true);
  };

  const createSegment = async (data) => {
    const type = selectedCard === 1 ? "static" : selectedCard === 2 ? "dynamic" : "manual";
    try {
      const response = await trigger({
        name: firstFormData.name,
        description: firstFormData.description,
        type: type,
        ...data,
      });

      if (response) {
        router.push("/dashboards/segments");
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
                    label="Title"
                    isInvalid={!!errors.name?.message}
                    error={[errors.name?.message]}
                  >
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <EuiFieldText
                          onChange={onChange}
                          value={value}
                          onBlur={onBlur}
                          placeholder="title"
                          fullWidth
                          required
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
                        icon={<EuiIcon size="xxl" type="logoSketch" />}
                        title="Static"
                        description="Example of a short card description."
                        selectable={{
                          onClick: () => cardClicked(1),
                          isSelected: selectedCard === 1,
                        }}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiCard
                        icon={<EuiIcon size="xxl" type="logoGCP" />}
                        title="Dynamic"
                        description="Example of a longer card description. See how the footers stay lined up."
                        selectable={{
                          onClick: () => cardClicked(2),
                          isSelected: selectedCard === 2,
                        }}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiCard
                        icon={<EuiIcon size="xxl" type="logoAerospike" />}
                        title="Manual"
                        description="Example of a short card description."
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
                {selectedCard === 1 && (
                  <Static
                    createSegment={createSegment}
                    isCreateSegmentMutating={isCreateSegmentMutating}
                  />
                )}
                {selectedCard === 2 && (
                  <Dynamic
                    createSegment={createSegment}
                    isCreateSegmentMutating={isCreateSegmentMutating}
                  />
                )}
                {selectedCard === 3 && (
                  <Manual
                    createSegment={createSegment}
                    isCreateSegmentMutating={isCreateSegmentMutating}
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
