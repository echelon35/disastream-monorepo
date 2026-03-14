import { Alea } from "./Alea";

export enum CriteriaType {
    LESS = "<",
    MORE = ">",
    LESS_EQUAL = "<=",
    MORE_EQUAL = ">=",
    EQUAL = "="
}

export class Criteria {
    alea: Alea = new Alea();
    name = "";
    label = "";
    min?: number;
    max?: number;
}

export class AlertCriteria {
    criteria: Criteria = new Criteria();
    criteriaType?: CriteriaType;
    value = "";

    constructor(criteria: Criteria) {
        this.criteria = criteria;
    }
}