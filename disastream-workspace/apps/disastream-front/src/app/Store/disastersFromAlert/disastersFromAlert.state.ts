import { Disaster } from "src/app/Model/Disaster";

export type LoadDisastersFromAlertsState = {
    alertId: number;
    disasters: Disaster[];
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    filter: string;
    order: string;
    country: string;
    city: string;
    premier_releve: string;
    dernier_releve: string;
    disasterCount: number;
    limit: number;
    nbPages: number;
    withCriterias: boolean;
};

export const initialState: LoadDisastersFromAlertsState = {
    alertId: -1,
    disasters: [],
    withCriterias: true,
    isLoading: false,
    error: null,
    currentPage: 1,
    filter: 'premier_releve',
    order: 'ASC',
    country: '',
    city: '',
    premier_releve: '',
    dernier_releve: '',
    disasterCount: 0,
    limit: 20,
    nbPages: 0,
};