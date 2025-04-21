// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  EuiBadge,
  EuiBasicTable,
  EuiButton,
  EuiButtonEmpty,
  EuiColorPicker,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSpacer,
  EuiConfirmModal,
} from "@elastic/eui";
import { useRouter } from "next/router";
import tagApi, { Tag } from "@/api/tags";
import NestedLayout from "../layout";
import useSWR from "swr";

const TicketTags = () => {
  const router = useRouter();

  // Extract query parameters for pagination
  const { query } = router;
  const initialPageIndex = query.pageIndex ? parseInt(query.pageIndex as string, 10) : 0;
  const initialPageSize = query.pageSize ? parseInt(query.pageSize as string, 10) : 5;

  const [tags, setTags] = useState<Tag[]>([]);
  const [totalTags, setTotalTags] = useState(0); // Total number of tags for pagination
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000"); // Default color
  const [isConfirmVisible, setIsConfirmVisible] = useState(false); // For confirmation dialog
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null); // Tag to delete

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ["ticket/tags", pagination.pageSize, pagination.pageIndex],
    async ([, limit, offset]) => {
      return await tagApi.getTags({ limit, offset: offset + 1 });
    },
  );

  const openModal = (tag?: Tag) => {
    if (tag) {
      setIsEditing(true);
      setCurrentTag(tag);
      setName(tag.name);
      setColor(tag.color || "#000000");
    } else {
      setIsEditing(false);
      setCurrentTag(null);
      setName("");
      setColor("#000000");
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleSave = async () => {
    try {
      if (isEditing && currentTag) {
        // Update tag
        const newTag = await tagApi.updateTagById({
          ...currentTag,
          name: name,
          color: color
        });
        mutate();
      } else {
        // Create new tag
        const newTag = await tagApi.create({
          name,
          color,
        });
        mutate();
      }
      closeModal();
    } catch (error) {
      console.error("Error saving tag:", error);
    }
  };

  const showDeleteConfirmation = (tag: Tag) => {
    setTagToDelete(tag);
    setIsConfirmVisible(true);
  };

  const closeDeleteConfirmation = () => {
    setIsConfirmVisible(false);
    setTagToDelete(null);
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;

    try {
      await tagApi.delete(tagToDelete.id);
      mutate(
        (currentData) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            results: currentData.results.filter((tag) => tag.id !== tagToDelete.id),
          };
        },
        { revalidate: false },
      );
      closeDeleteConfirmation();
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  const onTableChange = ({ page }: { page: { index: number; size: number } }) => {
    const { index, size } = page;

    // Update query parameters in the URL
    router.push({
      pathname: router.pathname,
      query: { ...query, pageIndex: index, pageSize: size },
    });
  };

  useEffect(() => {
    const { pageIndex, pageSize } = query;
    setPagination({
      pageIndex: pageIndex ? parseInt(pageIndex as string, 10) : 0,
      pageSize: pageSize ? parseInt(pageSize as string, 10) : 5,
    });
  }, [query]);

  const columns = [
    {
      field: "name",
      name: "Нэр",
      render: (name: string, record: Tag) => (
        <EuiBadge color={record.color || "default"}>{name || "-нэргүй-"}</EuiBadge>
      ),
    },
    {
      name: "Үйлдлүүд",
      actions: [
        {
          name: "Засах",
          description: "Төрөл засах",
          icon: "pencil",
          type: "icon",
          onClick: (tag: Tag) => openModal(tag),
        },
        {
          name: "Устгах",
          description: "Төрөл устгах",
          icon: "trash",
          type: "icon",
          color: "danger",
          onClick: (tag: Tag) => showDeleteConfirmation(tag),
        },
      ],
    },
  ];

  return (
    <NestedLayout
      pageHeader={{
        pageTitle: "Тикетийн төрөл",
      }}
    >
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => openModal()} disabled={isLoading}>
            Төрөл нэмэх
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiBasicTable
        items={data ? data?.results : []}
        columns={columns}
        pagination={
          data?.total_pages > 1
            ? {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                totalItemCount: data?.total_count,
                pageSizeOptions: [3, 5, 10, 20],
              }
            : null
        }
        onChange={onTableChange}
      />
      {isModalVisible && (
        <EuiOverlayMask>
          <EuiModal onClose={closeModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>{isEditing ? "Төрөл засах" : "Төрөл нэмэх"}</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiForm component="form">
                <EuiFormRow label="Нэр">
                  <EuiFieldText value={name} onChange={(e) => setName(e.target.value)} />
                </EuiFormRow>
                <EuiFormRow label="Өнгө">
                  <EuiColorPicker
                    color={color}
                    onChange={setColor}
                    showAlpha={false} // Optional: Disable alpha channel
                  />
                </EuiFormRow>
              </EuiForm>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButtonEmpty onClick={closeModal}>Болих</EuiButtonEmpty>
              <EuiButton onClick={handleSave} fill>
                Хадгалах
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      )}
      {isConfirmVisible && (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="Төрөл устгах"
            onCancel={closeDeleteConfirmation}
            onConfirm={confirmDelete}
            cancelButtonText="Болих"
            confirmButtonText="Устгах"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
            <p>Та энэ төрлийг устгахдаа итгэлтэй байна уу?</p>
          </EuiConfirmModal>
        </EuiOverlayMask>
      )}
    </NestedLayout>
  );
};

export default TicketTags;
