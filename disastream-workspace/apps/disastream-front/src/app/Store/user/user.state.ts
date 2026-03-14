import { User } from "src/app/Model/User";

export interface UserState {
  user: User;
  error: string | null;
  loading: boolean;
}

export const initialState = {
  user: {} as User,
  error: null,
  loading: false
} as UserState;