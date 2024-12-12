import { useRouter } from "next/router";
import { createContext, useContext } from "react";
import useGetSegments, { Segment } from "../hooks/useGetSegments";
import { InitialSegmentState } from "./segment_store.types";

const initialSegmentState: InitialSegmentState = {
  data: undefined,
  isLoading: true,
};

export const segmentContext = createContext(initialSegmentState);

export const useSegmentContext = () => {
  return useContext(segmentContext);
};

export const SegmentProvider = ({ children }) => {
  const router = useRouter();

  const { data, isLoading } = useGetSegments<Segment>(router.query.id);

  return (
    <segmentContext.Provider
      value={{
        data,
        isLoading,
      }}
    >
      {children}
    </segmentContext.Provider>
  );
};
