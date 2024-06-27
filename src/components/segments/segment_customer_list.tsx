import { EuiPanel } from "@elastic/eui";
import { useRouter } from "next/router";
import useGetSegmentCustomerList from "../../hooks/useGetSegmentCustomerList";

const SegmentCustomerList = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useGetSegmentCustomerList(id);

  if (!data) return <div>empty</div>;

  return <EuiPanel>a</EuiPanel>;
};

export default SegmentCustomerList;
