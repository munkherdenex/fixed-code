export interface UserDataType {
  email: string;
  fname: string;
  lname: string;
  registered_date: Date;
}

export interface MembersType {
  id: number;
  joined_date: Date;
  role: string;
  status: string;
  user: UserDataType;
}
