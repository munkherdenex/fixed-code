const Settings = () => {
  return null;
};

export async function getServerSideProps() {
  return {
    props: {},
    redirect: {
      destination: "/dashboards/settings/management",
    },
  };
}

export default Settings;
