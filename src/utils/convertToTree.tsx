import { Teams } from "../store/teams_store.types";

export const convertToTree = (data: Teams[], changeCurrentTeam: (teamId: number) => void) => {
  if (!Array.isArray(data)) {
    return [];
  }

  const idMapping = data.reduce((acc, el) => {
    acc[el.id] = {
      ...el,
      id: `${el.id}`,
      label: el.name,
      callback: () => changeCurrentTeam(el.id),
      children: [],
    };
    delete acc[el.id].name;
    return acc;
  }, {});

  let root = [];

  data.forEach((el) => {
    if (el.parent_id === null) {
      root.push(idMapping[el.id]);
    } else {
      const parentEl = idMapping[el.parent_id];
      if (parentEl) {
        parentEl.children.push(idMapping[el.id]);
      }
    }
  });

  const addParentProperties = (node) => {
    if (node.children.length > 0) {
      node.isExpanded = true;
      node.children.forEach(addParentProperties);
    }
  };

  root.forEach(addParentProperties);

  return root;
};
