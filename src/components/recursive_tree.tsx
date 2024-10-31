import { EuiIcon } from "@elastic/eui";
import { Node } from "@elastic/eui/src/components/tree_view/tree_view";
import { managementTeamsTreeStyles } from "./management/management_teams_tree_view.styles";

const RecursiveTree = ({ tree }: { tree: Node[] }) => {
  const styles = managementTeamsTreeStyles();

  if (tree.length === 0) {
    return null;
  }

  if (tree.length > 0) {
    return (
      <>
        <ul css={styles.ul}>
          {tree?.map((item) => (
            <li css={styles.li} key={item.id}>
              <div
                onClick={() => item.callback()}
                style={{
                  backgroundColor: item?.icon ? "rgba(0, 0, 0, 0.1)" : "transparent",
                  borderRadius: "5px",
                  paddingRight: "5px",
                  paddingLeft: "5px",
                  cursor: "pointer",
                }}
              >
                {item?.icon ? item.icon : <EuiIcon type="empty" />}
                <button css={styles.button} onClick={() => item.callback()} color="text">
                  {item.label}
                </button>
              </div>
              <RecursiveTree tree={item.children} />
            </li>
          ))}
        </ul>
      </>
    );
  }
};

export default RecursiveTree;
