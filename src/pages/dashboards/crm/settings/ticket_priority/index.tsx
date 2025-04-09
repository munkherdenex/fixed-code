import React, { useEffect, useState } from "react";
import {
  EuiBasicTable,
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSpacer,
} from "@elastic/eui";
import { NestedLayout } from "../layout";
import ticketTemplateApi from '@/api/ticket_template';

interface Priority {
  id: number;
  name: string;
  duration: string;
}

const TicketPriority = () => {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPriority, setCurrentPriority] = useState<Priority | null>(null);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");

  const loadPriorities = async () => {
    try {
      const data = await ticketTemplateApi.getPriorities();
      setPriorities(data.results);
    } catch (error) {
      console.error("Чухлын зэрэг ачааллахад алдаа гарлаа:", error);
    }
  };

  useEffect(() => {
    loadPriorities();
  }, []);

  const openModal = (priority?: Priority) => {
    if (priority) {
      setIsEditing(true);
      setCurrentPriority(priority);
      setName(priority.name);
      setDuration(priority.duration);
    } else {
      setIsEditing(false);
      setCurrentPriority(null);
      setName("");
      setDuration("");
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleSave = () => {
    if (isEditing && currentPriority) {
      ticketTemplateApi.editPriority(currentPriority.id, { name, duration })
      .then(() => {
        setPriorities((prev) =>
        prev.map((p) =>
          p.id === currentPriority.id ? { ...p, name, duration } : p
        )
        );
      })
      .catch((error) => {
        console.error("Чухлын зэрэг засахад алдаа гарлаа:", error);
      });
    } else {
      ticketTemplateApi.createPriority({ name, duration })
      .then((newPriority) => {
        setPriorities((prev) => [...prev, newPriority]);
      })
      .catch((error) => {
        console.error("Чухлын зэрэг үүсгэхэд алдаа гарлаа:", error);
      });
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    ticketTemplateApi.deletePriority(id)
      .then(() => {
      setPriorities((prev) => prev.filter((p) => p.id !== id));
      })
      .catch((error) => {
      console.error("Чухлын зэрэг устгахад алдаа гарлаа:", error);
      });
  };

  const columns = [
    {
      field: "name",
      name: "Нэр",
    },
    {
      field: "duration",
      name: "Хугацаа",
    },
    {
      name: "Үйлдлүүд",
      actions: [
        {
          name: "Засах",
          description: "Энэ чухлын зэргийг засах",
          icon: "pencil",
          type: "icon",
          onClick: (priority: Priority) => openModal(priority),
        },
        {
          name: "Устгах",
          description: "Энэ чухлын зэргийг устгах",
          icon: "trash",
          type: "icon",
          color: "danger",
          onClick: (priority: Priority) => handleDelete(priority.id),
        },
      ],
    },
  ];

  return (
    <NestedLayout
      pageHeader={{
        pageTitle: "Чухлын зэрэг",
      }}
    >
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => openModal()}>Чухлын зэрэг нэмэх</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiBasicTable items={priorities} columns={columns} />
      {isModalVisible && (
        <EuiOverlayMask>
          <EuiModal onClose={closeModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                {isEditing ? "Чухлын зэрэг засах" : "Чухлын зэрэг нэмэх"}
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiFormRow label="Нэр">
                <EuiFieldText
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </EuiFormRow>
              <EuiFormRow label="Хугацаа">
                <EuiFieldText
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </EuiFormRow>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButton onClick={closeModal} color="text">
                Болих
              </EuiButton>
              <EuiButton onClick={handleSave} fill>
                Хадгалах
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      )}
    </NestedLayout>
  );
};

export default TicketPriority;