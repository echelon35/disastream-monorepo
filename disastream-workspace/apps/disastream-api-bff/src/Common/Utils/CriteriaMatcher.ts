import { Disaster, Earthquake } from '@disastream/models';
import { AlertCriteria } from '../../Domain/alert.model';

export class CriteriaMatcher {
  static match(
    alertCriterias: AlertCriteria[],
    disaster: Disaster,
    disasterType: string,
  ): boolean {
    if (!alertCriterias || !Array.isArray(alertCriterias)) {
      return true;
    }

    // Search criterias available for the current aleas
    const criteriaForCurrentAlea = alertCriterias.filter(
      (c: AlertCriteria) => c.aleaName === disasterType,
    );

    if (criteriaForCurrentAlea.length === 0) {
      return true;
    }

    return criteriaForCurrentAlea.every((criterion: AlertCriteria) => {
      let disasterValue: number;

      switch (disasterType) {
        case 'earthquake':
          if (criterion.field.toLowerCase() === 'magnitude') {
            disasterValue = (disaster as Earthquake).magnitude;
          }
          break;
        // case 'hurricane':
        //   if (field.toLowerCase() === 'catégorie') {
        //     disasterValue = (disaster as Hurricane).category;
        //   }
        //   break;
        default:
          // Generic approach for other disaster types
          const key = Object.keys(disaster).find(
            (k) => k.toLowerCase() === criterion.field.toLowerCase(),
          );
          if (key) disasterValue = (disaster as Disaster)[key];
      }

      if (disasterValue === undefined || disasterValue === null) {
        return true; // Cannot evaluate, so valid
      }

      // Evaluate the expression
      switch (criterion.operator) {
        case '>':
          return disasterValue > criterion.value;
        case '<':
          return disasterValue < criterion.value;
        case '>=':
          return disasterValue >= criterion.value;
        case '<=':
          return disasterValue <= criterion.value;
        case '=':
          return disasterValue == criterion.value;
        default:
          return true;
      }
    });
  }
}
