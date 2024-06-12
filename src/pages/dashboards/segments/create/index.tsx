import Head from "next/head";
import { FunctionComponent, useState } from "react";
import DashboardLayout from "../../../../layouts/dashboard";
import {
  EuiBreadcrumbs,
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
import Static from "../../../../components/segments/static";
import Dynamic from "../../../../components/segments/dynamic";
import Manual from "../../../../components/segments/manual";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const [_, setFirstFormData] = useState(null);
  const [selectedCard, setCard] = useState(1);
  const [openFlyout, setOpenFlyout] = useState(false);

  const flyoutTitleId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const cardClicked = (number: number) => {
    setCard(number);
  };

  const detailsClicked = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  const addSubscriber = (e) => {
    e.preventDefault();

    setFirstFormData({
      title: e.target.title.value,
      description: e.target.description.value,
    });

    setOpenFlyout(true);
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
                href: `${pathPrefix}/dashboards`,
              },
              {
                text: "Segments",
                href: `${pathPrefix}/dashboards/segments`,
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
            <EuiForm component="form" onSubmit={addSubscriber}>
              <EuiFlexGroup direction="column">
                <EuiFlexItem>
                  <EuiFormRow label="Title">
                    <EuiFieldText name="title" placeholder="title" fullWidth required />
                  </EuiFormRow>
                  <EuiFormRow label="Description">
                    <EuiTextArea
                      placeholder="Placeholder text"
                      name="description"
                      aria-label="Use aria labels when no actual label is in use"
                      required
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
                        footer={
                          <EuiButtonEmpty
                            iconType="iInCircle"
                            size="xs"
                            onClick={detailsClicked}
                            aria-label="See more details about Sketch"
                          >
                            More details
                          </EuiButtonEmpty>
                        }
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
                        footer={
                          <EuiButtonEmpty
                            iconType="iInCircle"
                            size="xs"
                            onClick={detailsClicked}
                            aria-label="See more details about Google"
                          >
                            More details
                          </EuiButtonEmpty>
                        }
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
                        footer={
                          <EuiButtonEmpty
                            iconType="iInCircle"
                            size="xs"
                            onClick={detailsClicked}
                            aria-label="See more details about Not Adobe"
                          >
                            More details
                          </EuiButtonEmpty>
                        }
                        selectable={{
                          onClick: () => cardClicked(3),
                          isSelected: selectedCard === 3,
                        }}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiButton type="submit">Add subscriber</EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiForm>
          </EuiPanel>
          {openFlyout && (
            <EuiFlyout onClose={() => setOpenFlyout(false)}>
              <EuiFlyoutHeader hasBorder aria-labelledby={flyoutTitleId}>
                <EuiTitle>
                  <h2 id={flyoutTitleId}>
                    {selectedCard === 1
                      ? "Static"
                      : selectedCard === 2
                      ? "Dynamic"
                      : selectedCard === 3
                      ? "Manual"
                      : ""}
                  </h2>
                </EuiTitle>
              </EuiFlyoutHeader>
              <EuiFlyoutBody>
                {selectedCard === 1 ? (
                  <Static />
                ) : selectedCard === 2 ? (
                  <Dynamic />
                ) : selectedCard === 3 ? (
                  <Manual />
                ) : (
                  <></>
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
