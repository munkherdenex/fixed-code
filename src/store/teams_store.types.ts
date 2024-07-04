export interface Member {
  user: {
    email: string;
    fname: string;
    lname: string;
    registered_date: Date | null;
  };
  role: string;
  status: string;
  joined_date: null | Date;
}

export interface Teams {
  id: number;
  name: string;
  description: string;
  admin_id: number;
  parent_id: number;
  created_at: string;
  updated_at: string;
  members: Member[];
}

export interface Initial_Teams_Type {
  teams: Teams[] | null;
  currentTeam: Teams | null;
  setCurrentTeam: React.Dispatch<React.SetStateAction<Teams | null>>;
  changeCurrentTeam: (teamId: number) => void;
  clearCurrentTeam: () => void;
}
