import {
  EuiBadge,
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useRouter } from "next/router";
import useTestSend from "../../hooks/useTestSend";
import { addToast } from "../toast";
import { useTranslations } from "next-intl";
import useGetTesterCustomers from "../../hooks/useGetTesterCustomers";
import { useState } from "react";

const LIMIT = "10";

const TestCampaignFlyout = ({ closeFlyout }: { closeFlyout: () => void }) => {
  const router = useRouter();
  const translate = useTranslations();
  const templateId = router.query?.id;
  const { isMutating, trigger } = useTestSend();
  const [searchValue, setSearchValue] = useState("");
  const { data: customers, isLoading: isGetCustomersLoading } = useGetTesterCustomers({
    query: searchValue,
    limit: LIMIT,
  });
  const [selectedTesters, setSelectedTesters] = useState([]);

  const dataTypeOptions: EuiComboBoxOptionOption[] =
    (Array.isArray(customers?.results) &&
      customers?.results?.map((customer) => {
        return {
          label: customer?.email || customer?.phone || customer?.rid,
          value: customer?.id,
          append: <EuiBadge>{customer?.phone || customer?.email || customer?.rid}</EuiBadge>,
        };
      })) ||
    [];

  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  let searchTimeout: NodeJS.Timeout;
  const onSearch = async (data: string) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearchValue(data);
    }, 500);
  };

  const onSubmit = async () => {
    if (!selectedTesters.length) {
      addToast({
        id: "success",
        title: translate("error"),
        text: translate("select-at-least-one-tester"),
        color: "danger",
      });
      return false;
    }

    const ids = selectedTesters.map((testerRow) => {
      console.debug(testerRow);
      return +testerRow.value;
    });

    trigger({ templateId: +templateId, testerIds: ids });

    addToast({
      id: "success",
      title: "Successfully sent",
      text: "Sent to: " + ids,
      color: "success",
    });
    closeFlyout();
  };

  return (
    <EuiFlyout onClose={closeFlyout}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2>{translate("test_send")}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={onSubmit}>
          <EuiFormRow label={translate("customers")}>
            <EuiComboBox
              placeholder="Email address"
              options={dataTypeOptions}
              onChange={(selected) => {
                setSelectedTesters(selected);
              }}
              onSearchChange={onSearch}
              selectedOptions={selectedTesters}
              isLoading={isGetCustomersLoading}
            />
          </EuiFormRow>
          <EuiButton isLoading={isMutating} disabled={isMutating} type="submit">
            {translate("send")}
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default TestCampaignFlyout;
