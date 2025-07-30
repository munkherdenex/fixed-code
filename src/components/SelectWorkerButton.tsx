import React, { useState, useEffect } from "react";
import {
  EuiButton,
  EuiPopover,
  EuiContextMenuPanel,
  EuiContextMenuItem,
} from "@elastic/eui";
import useAllWorkers from "@/hooks/useAllWorkers";
import { Teams } from "@/store/teams_store.types";

interface Worker {
  id: number;
  user: {
    fname: string;
    lname: string;
  };
}

interface SelectWorkerButtonProps {
  ticketId: any;
  fieldName: any;
  currentValue: any;
  currentTeam: Teams;
}

export default function SelectWorkerButton({
  ticketId,
  fieldName,
  currentValue,
  currentTeam,
}: SelectWorkerButtonProps)
 {
  console.log(" RENDER SelectWorkerButton", { currentTeam });
  const currentTeamId = localStorage.getItem("currentTeamId");
  console.log(" SelectWorkerButton currentTeam =", currentTeamId);

  const { data: teamData, isLoading, error } = useAllWorkers<{ workers: Worker[] }>(currentTeamId);
  const workers = teamData?.workers || [];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    console.log(" SelectWorkerButton mounted");
  }, []);

  useEffect(() => {
    if (workers.length) {
      console.log(" Workers loaded:", workers);
    } else if (!isLoading) {
      console.warn(" No workers loaded");
    }
  }, [workers, isLoading]);

  useEffect(() => {
    if (error) {
      console.error(" Failed to load workers", error);
    }
  }, [error]);

  const togglePopover = () => setIsPopoverOpen(!isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const handleWorkerSelect = (workerId: string) => {
    console.log(" Selected worker ID:", workerId);
    closePopover();
  };

const selectedWorkerLabel = workers.find((w) => w.id === Number(currentValue));
  const displayName = selectedWorkerLabel
    ? `${selectedWorkerLabel.user.fname} ${selectedWorkerLabel.user.lname}`
    : "Ажилчин сонгох";

  const button = (
    <EuiButton
      style={{ border: "2px solid black" }}
      iconType="arrowDown"
      iconSide="right"
      onClick={togglePopover}
      isLoading={isLoading}
    >
      {displayName}
    </EuiButton>
  );

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition="downCenter"
    >
      <EuiContextMenuPanel
        items={workers.map((worker) => (
          <EuiContextMenuItem
            key={worker.id}
            onClick={() => handleWorkerSelect(String(worker.id))}
          >
            {worker.user.fname} {worker.user.lname}
          </EuiContextMenuItem>
        ))}
      />
    </EuiPopover>
  );
}
