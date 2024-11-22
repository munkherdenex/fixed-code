import { createContext, useContext, useMemo } from "react";
import { TEAM_PRODUCTS } from "../constants";
import useGetProducts, { Product } from "../hooks/useGetProducts";

export interface FrontProduct {
  name: string;
  icon: string;
  selected: boolean;
  title: string;
  description: string;
  link: string;
}

const initialSegmentState: {
  products: Product[];
  avialableProducts: (FrontProduct & Product)[];
} = {
  products: [],
  avialableProducts: [],
};

export const productContext = createContext(initialSegmentState);

export const useProductContext = () => {
  return useContext(productContext);
};

export const ProductProvider = ({ children }) => {
  const { data: products } = useGetProducts<Product[]>();

  const avialableProducts = useMemo(() => {
    const productsSet = new Set(products?.map((prod) => prod.name));

    const mergedProducts = TEAM_PRODUCTS.map((product) =>
      Object.assign(
        {},
        product,
        products?.find((prod) => prod.name === product.name),
      ),
    );

    return mergedProducts?.filter((product) => {
      return productsSet.has(product.name);
    });
  }, [products]);

  return (
    <productContext.Provider
      value={{
        products,
        avialableProducts,
      }}
    >
      {children}
    </productContext.Provider>
  );
};
