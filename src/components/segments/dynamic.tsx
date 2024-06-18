import { QueryBuilder } from "react-querybuilder";

const Dynamic = ({
  createSegment,
  isCreateSegmentMutating,
}: {
  createSegment: (data: any) => void;
  isCreateSegmentMutating: boolean;
}) => {
  return (
    <>
      <div>Dynamic</div>
      <QueryBuilder />
    </>
  );
};

export default Dynamic;
