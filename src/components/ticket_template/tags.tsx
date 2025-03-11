// @ts-nocheck

import React, { useState } from "react";
import {
  EuiBadge,
  EuiPopover,
  EuiFormRow,
  EuiFieldText,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiColorPicker,
  EuiButtonEmpty,
} from "@elastic/eui";
import useSWR from "swr";
import tagApi from "../../api/tags";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagsResponse {
  results: Tag[];
}

const TagsManager = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");

  const { data: tags, mutate, error } = useSWR<TagsResponse>("/crm/tag/", () => tagApi.getTags({}));

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const handleSaveTag = async () => {
    const newTag = {
      name: newTagName,
      color: newTagColor,
    };

    await tagApi.create(newTag);

    mutate();

    setNewTagName("");
    setNewTagColor("#000000");
    closePopover();
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await tagApi.delete(id);
      mutate();
    } catch (e) {
      console.log(e);
    }
  };

  const button = (
    <EuiButtonEmpty iconType="plusInCircle" color="primary" onClick={onButtonClick}>
      Add Tag
    </EuiButtonEmpty>
  );

  if (error) return <div>Failed to load tags</div>;
  if (!tags?.results) return <div>Loading...</div>;

  return (
    <div>
      <EuiFlexGroup gutterSize="s" alignItems="center">
        {tags.results.map((tag) => (
          <EuiFlexItem key={tag.id} grow={false}>
            <EuiBadge
              color={tag.color}
              iconType="cross"
              iconSide="right"
              iconOnClick={() => handleDeleteTag(tag.id)}
              iconOnClickAriaLabel="Remove tag" // Add this prop
            >
              {tag.name}
            </EuiBadge>
          </EuiFlexItem>
        ))}
        <EuiPopover button={button} isOpen={isPopoverOpen} closePopover={closePopover}>
          <EuiFormRow label="Tag Name">
            <EuiFieldText value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
          </EuiFormRow>
          <EuiFormRow label="Tag Color">
            <EuiColorPicker color={newTagColor} onChange={setNewTagColor} />
          </EuiFormRow>
          <EuiButton onClick={handleSaveTag} fill>
            Save Tag
          </EuiButton>
        </EuiPopover>
      </EuiFlexGroup>
    </div>
  );
};

export default TagsManager;
