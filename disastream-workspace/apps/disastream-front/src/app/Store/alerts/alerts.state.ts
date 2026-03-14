import { AlertVm } from "src/app/Pages/DisasterView/disaster.view";

export type LoadAlertsState = {
  alerts: AlertVm[];
  isLoading: boolean;
  error: string | null;
};

export const initialState: LoadAlertsState = {
  alerts: [],
  isLoading: false,
  error: null,
};