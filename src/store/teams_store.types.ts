import { Product } from "../hooks/useGetAvailableProduct";
import { TeamsMyProfileResponse } from "../hooks/useGetTeamsMyprofile";

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
  parent_team: Teams | null;
}

export interface Initial_Teams_Type {
  teamProducts: Product[] | null;
  teams: Teams[] | null;
  currentTeam: Teams | null;
  myProfile: TeamsMyProfileResponse | null;
  setCurrentTeam: React.Dispatch<React.SetStateAction<Teams | null>>;
  changeCurrentTeam: (teamId: number) => void;
  clearCurrentTeam: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
  isAccountActive: boolean;
  isCDPEnabled?: boolean;
  isCRMEnabled?: boolean;
}
