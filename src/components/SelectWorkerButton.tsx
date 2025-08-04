import React, { useState, useEffect, useMemo } from "react";
import {
  EuiFormRow,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiButtonIcon,
  EuiSpacer,
} from "@elastic/eui";
import useAllWorkers from "@/hooks/useAllWorkers";
import { Teams } from "@/store/teams_store.types";
import ticketApi from "../api/ticket";
import { mutate } from "swr";

interface Worker {
  id: string;
  user: {
    email: string;
  };
}

interface SelectWorkerButtonProps {
  ticketId: any;
  fieldName: any;
  currentValue: any;
  currentTeam: Teams;
  onChange: (workerId: string) => void;
}

export default function SelectWorkerButton({
  ticketId,
  fieldName,
  currentValue,
  currentTeam,
  onChange,
}: SelectWorkerButtonProps) {
  const currentTeamId = localStorage.getItem("currentTeamId");
  const { data: teamData, isLoading, error } = useAllWorkers<{ workers: Worker[] }>(currentTeamId);
  const workers = teamData?.workers || [];

  const [selectedOptions, setSelectedOptions] = useState<EuiComboBoxOptionOption<string>[]>([]);
  const [prevValue, setPrevValue] = useState<EuiComboBoxOptionOption<string>[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  let searchTimeout: NodeJS.Timeout;

  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearchValue(value.toLowerCase());
    }, 500);
  };

  const workerOptions: EuiComboBoxOptionOption<string>[] = useMemo(() => {
    return workers
      .filter((worker) =>
        worker.user.email.toLowerCase().includes(searchValue)
      )
      .map((worker) => ({
        label: worker.user.email,
        value: worker.id,
      }));
  }, [workers, searchValue]);

  useEffect(() => {
    const matchedWorker = workerOptions.find((opt) => opt.value === currentValue);
    if (matchedWorker) {
      setSelectedOptions([matchedWorker]);
      setPrevValue([matchedWorker]);
    }
  }, [currentValue, workerOptions]);

  const toggleEdit = () => {
    setPrevValue(selectedOptions);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setSelectedOptions(prevValue);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    try {
      const selectedId = selectedOptions.length > 0 ? selectedOptions[0].value : null;

      const payload = {
        [fieldName]: selectedId,
      };

      console.log("Saving with payload:", payload);

      await ticketApi.update(ticketId, payload);
      mutate("/crm/ticket/");
      onChange(selectedId);
      console.log("onChange triggered with:", selectedId);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      mutate("/crm/ticket/");
    }
  };

  const handleChange = (selected: EuiComboBoxOptionOption<string>[]) => {
    setSelectedOptions(selected);
  };

  return (
    <EuiFlexGroup alignItems="center" gutterSize="s">
      <EuiFlexItem grow>
        <EuiFormRow>
          {isEditing ? (
            <EuiComboBox
              placeholder="Имэйл"
              singleSelection={{ asPlainText: true }}
              options={workerOptions}
              selectedOptions={selectedOptions}
              onChange={handleChange}
              isClearable
              isLoading={isLoading}
              fullWidth
              onSearchChange={onSearchChange}
            />
          ) : (
            <EuiText>{selectedOptions[0]?.label || "Сонгох"}</EuiText>
          )}
        </EuiFormRow>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiSpacer size="s" />
          <EuiFlexItem grow={false}>
            {!isEditing ? (
              <EuiButtonIcon onClick={toggleEdit} iconType="pencil" aria-label="Edit" />
            ) : (
              <EuiButtonIcon onClick={saveEdit} iconType="check" aria-label="Save" />
            )}
          </EuiFlexItem>
          {isEditing && (
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                onClick={cancelEdit}
                iconType="error"
                color="danger"
                aria-label="cancel"
              />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
