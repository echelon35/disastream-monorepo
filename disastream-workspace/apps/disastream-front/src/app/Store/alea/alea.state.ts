import { Alea } from "src/app/Model/Alea";

export type LoadAleasState = {
  aleas: Alea[];
  isLoading: boolean;
  error: string | null;
};

export const initialState: LoadAleasState = {
  aleas: [],
  isLoading: false,
  error: null,
};