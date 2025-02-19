import { useContext, useEffect, useState } from "react";
import { EuiComboBox, EuiComboBoxOptionOption, EuiForm, EuiFormRow } from "@elastic/eui";
import { teamsContext } from "../../store/teams_store";
import useTeams from "../../hooks/useTeams";
import { Teams } from "../../store/teams_store.types";

const WorkersSelect = ({ isLoading, isDisabled, onSelect, initialValue }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const { currentTeam } = useContext(teamsContext);
  const { data } = useTeams<Teams>(currentTeam?.id.toString(), { members: "true" });

  useEffect(() => {
    if (data?.members && initialValue) {
      const selectedWorker = data.members.find((el) => el.id === initialValue);

      if (selectedWorker) {
        const user = {
          label: selectedWorker.user.fname,
          "aria-label": selectedWorker.user.fname,
          value: selectedWorker.user.email,
        };
        setSelectedOptions([user]);
      } else {
        setSelectedOptions([]);
      }
    } else {
      setSelectedOptions([]);
    }
  }, [data, initialValue]);

  const dataTypeOptions: EuiComboBoxOptionOption[] =
    data?.members?.map((member) => {
      return {
        label: member?.user?.fname || "Unknown",
        "aria-label": `${member?.user?.fname || "Unknown"}`,
        value: String(member?.user?.email || ""),
      };
    }) || [];

  return (
    <>
      <EuiFormRow label="Ажилчин">
        <EuiComboBox
          placeholder="Search"
          singleSelection={{ asPlainText: true }}
          options={dataTypeOptions}
          onChange={(selected) => {
            console.log(selected);
            setSelectedOptions(selected);
            if (selected.length > 0) {
              onSelect(selected[0].value);
            }
          }}
          selectedOptions={selectedOptions}
          isClearable={false}
          isLoading={isLoading}
          isDisabled={isDisabled}
        />
      </EuiFormRow>
    </>
  );
};

export default WorkersSelect;
