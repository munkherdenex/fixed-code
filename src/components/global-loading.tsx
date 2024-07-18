import { globalLoadingStyles } from "../styles/global-loading.styles";

function GlobalLoading() {
  const styles = globalLoadingStyles();

  return (
    <div css={styles.style}>
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default GlobalLoading;
