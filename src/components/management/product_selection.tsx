import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiKeyPadMenu,
  EuiKeyPadMenuItem,
  EuiPanel,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { TEAM_PRODUCTS } from "../../constants";
import useDeleteProductFromTeam from "../../hooks/useDeleteProductFromTeam";
import useGetAvailableProduct from "../../hooks/useGetAvailableProduct";
import { Product } from "../../hooks/useGetProducts";
import useSetProductToTeam from "../../hooks/useSetProductToTeam";
import { useManagementTeamsContext } from "../../store/management_teams_store";
import { useProductContext } from "../../store/products_store";
import { useTranslations } from "next-intl";

const SchemaObject = Object.fromEntries(TEAM_PRODUCTS.map((field) => [field.name, yup.boolean()]));

const schema = yup.object().shape(SchemaObject);

const ProductSelection = () => {
  const translate = useTranslations();
  const { currentTeam, isAdmin } = useManagementTeamsContext();
  const { avialableProducts } = useProductContext();

  const [productId, setProductId] = useState<number | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

  const { data, isLoading, mutate } = useGetAvailableProduct<Product[]>(currentTeam?.id.toString());
  const { trigger: setTrigger } = useSetProductToTeam(productId, currentTeam?.id);
  const { trigger: deleteTrigger } = useDeleteProductFromTeam(deleteProductId, currentTeam?.id);

  const preparedData = useMemo(() => {
    return data?.reduce(
      (acc, product) => {
        acc[product.name] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }, [data]);

  const { control, reset } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: useMemo(() => {
      return preparedData;
    }, [preparedData]),
  });

  const deleteProduct = useCallback(async () => {
    const response = await deleteTrigger({});
    if (response) mutate();
  }, [deleteTrigger, mutate]);

  const sendRequest = useCallback(async () => {
    const response = await setTrigger({});
    if (response) mutate();
  }, [setTrigger, mutate]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    if (deleteProductId) {
      deleteProduct();
      return;
    }
    if (productId) {
      sendRequest();
      return;
    }
  }, [deleteProduct, sendRequest, deleteProductId, productId, isAdmin]);

  useEffect(() => {
    if (!productId && !deleteProductId) {
      reset(preparedData);
    }
  }, [reset, preparedData, productId, deleteProductId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiPanel paddingSize="s" color="subdued">
              {translate("select_products")}
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiForm component="form">
              <EuiFormRow>
                <EuiKeyPadMenu style={{ width: "fit-content" }}>
                  {avialableProducts.map((product) => {
                    return (
                      <Controller
                        control={control}
                        key={product.name}
                        name={product.name}
                        render={({ field: { onChange, value } }) => (
                          <EuiKeyPadMenuItem
                            isSelected={value}
                            checkable="multi"
                            label={product.name}
                            onChange={() => {
                              onChange(!value);
                              if (value) {
                                setProductId(null);
                                setDeleteProductId(product.id);
                              } else {
                                setProductId(product.id);
                                setDeleteProductId(null);
                              }
                            }}
                          >
                            <EuiIcon type={product.icon} size="l" />
                          </EuiKeyPadMenuItem>
                        )}
                      />
                    );
                  })}
                </EuiKeyPadMenu>
              </EuiFormRow>
            </EuiForm>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </div>
  );
};

export default ProductSelection;
