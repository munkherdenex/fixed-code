import {
  EuiButton,
  EuiButtonEmpty,
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
import { FunctionComponent, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import Dynamic from "../../../../../components/segments/dynamic";
import Manual from "../../../../../components/segments/manual";
import DashboardLayout from "../../../../../layouts/dashboard";
import { useTranslations } from "next-intl";
import { GetStaticProps } from "next/types";

const schema = yup.object({
  name: yup.string().required().label("Name"),
  description: yup.string().label("Description"),
});

type MyFormData = yup.InferType<typeof schema>;

const Dashboard: FunctionComponent = () => {
  const translate = useTranslations();

  const [firstFormData, setFirstFormData] = useState<MyFormData | null>(null);
  const [selectedCard, setCard] = useState(2);
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

  const addSubscriber = (data: MyFormData) => {
    setFirstFormData(data);
    setOpenFlyout(true);
  };

  return (
    <>
      <Head>
        <title>{translate("create-segment")}</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: translate("create-segment"),
          iconType: "dashboardApp",
        }}
      >
        <>
          <EuiPanel>
            <EuiForm component="form" onSubmit={handleSubmit(addSubscriber)}>
              <EuiFlexGroup direction="column">
                <EuiFlexItem>
                  <EuiFormRow
                    label={translate("name")}
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
                          placeholder={translate("name")}
                          fullWidth
                          isInvalid={!!errors.name?.message}
                        />
                      )}
                    />
                  </EuiFormRow>
                  <EuiFormRow label={translate("description")}>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <EuiTextArea
                          onChange={onChange}
                          value={value}
                          onBlur={onBlur}
                          placeholder={translate("description")}
                          fullWidth
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
                        title={translate("dynamic")}
                        description={translate("dynamic-segment-description")}
                      >
                        <EuiButton
                          onClick={() => cardClicked(2)}
                          iconType={selectedCard === 2 ? "check" : undefined}
                          color={selectedCard === 2 ? "success" : "primary"}
                          style={{ width: "100%", textAlign: "center" }}
                        >
                          {selectedCard === 2 ? "Сонгосон" : "Сонгох"}
                        </EuiButton>
                      </EuiCard>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiCard
                        icon={<EuiIcon size="xxl" type="notebookApp" />}
                        title={translate("manual.title")}
                        description={translate("manual-segment-description")}
                      >
                        <EuiButton
                          onClick={() => cardClicked(3)}
                          iconType={selectedCard === 3 ? "check" : undefined}
                          color={selectedCard === 3 ? "success" : "primary"}
                          style={{ width: "100%", textAlign: "center" }}
                        >
                          {selectedCard === 3 ? "Сонгосон" : "Сонгох"}
                        </EuiButton>
                      </EuiCard>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiButton type="submit">{translate("add-segment")}</EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiForm>
          </EuiPanel>
          {openFlyout && (
            <EuiFlyout onClose={() => setOpenFlyout(false)}>
              <EuiFlyoutHeader hasBorder aria-labelledby={flyoutTitleId}>
                <EuiTitle>
                  <h2 id={flyoutTitleId}>
                    {selectedCard === 2 && translate("dynamic")}{" "}
                    {selectedCard === 3 && translate("manual.title")}
                  </h2>
                </EuiTitle>
              </EuiFlyoutHeader>
              <EuiFlyoutBody>
                {selectedCard === 2 && (
                  <Dynamic name={firstFormData?.name} description={firstFormData?.description} />
                )}
                {selectedCard === 3 && (
                  <Manual name={firstFormData?.name} description={firstFormData?.description} />
                )}
              </EuiFlyoutBody>
            </EuiFlyout>
          )}
        </>
      </DashboardLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;
  const segments = (await import(`../../../../../messages/${context.locale}/segments.json`))
    .default;

  return {
    props: {
      messages: {
        ...common,
        ...segments,
      },
    },
  };
};

export default Dashboard;
