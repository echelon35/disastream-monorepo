import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { map } from "rxjs";
import { Earthquake } from "../Model/Earthquake";
import { Eruption } from "../Model/Eruption";
import { Flood } from "../Model/Flood";
import { Hurricane } from "../Model/Hurricane";

@Injectable({
  providedIn: 'root'
})
export class DisasterApiService {

  constructor(private readonly apollo: Apollo) {

  }

  searchEarthquakes() {
    return this.apollo.watchQuery<Earthquake[]>({
      query: gql`
              {
                earthquakes {
                  id,
                  point
                }
              }
            `
    }).valueChanges.pipe(map(result => result?.data))
  }

  searchEruptions() {
    return this.apollo.watchQuery<Eruption[]>({
      query: gql`
            {
              eruptions {
                id,
                point,
                surface
              }
            }
          `
    }).valueChanges.pipe(map(result => result?.data));
  }

  searchHurricanes() {
    return this.apollo.watchQuery<Hurricane[]>({
      query: gql`
            {
              hurricanes {
                id,
                point,
                surface,
                forecast,
                path,
                name
              }
            }
          `
    }).valueChanges.pipe(map(result => result?.data));
  }

  searchFloods() {
    return this.apollo.watchQuery<Flood[]>({
      query: gql`
              {
                floods {
                  id,
                  premier_releve,
                  dernier_releve,
                  point,
                  surface
                }
              }
            `
    }).valueChanges.pipe(map(result => result?.data));
  }

  searchHurricaneById(id: number) {
    return this.apollo.watchQuery<any>({
      query: gql`
            {
              hurricane(id:${id}) {
                id,
                premier_releve,
                dernier_releve,
                point,
                surface,
                forecast,
                path,
                name,
                source {
                  name
                }
              }
            }
          `
    }).valueChanges;
  }

  searchFloodById(id: number) {
    return this.apollo.watchQuery<any>({
      query: gql`
              {
                flood(id:${id}) {
                  id,
                  premier_releve,
                  dernier_releve,
                  point,
                  surface,
                  source {
                    name
                  },
                  createdAt,
                  updatedAt
                }
              }
            `
    }).valueChanges;
  }

  searchEarthquakeById(id: number) {
    return this.apollo.watchQuery<any>({
      query: gql`
            {
              earthquake(id:${id}) {
                id,
                premier_releve,
                dernier_releve,
                point,
                magnitude,
                source {
                  name
                },
                createdAt,
                updatedAt
              }
            }
          `
    }).valueChanges;
  }

  searchEruptionById(id: number) {
    return this.apollo.watchQuery<any>({
      query: gql`
            {
              eruption(id:${id}) {
                id,
                premier_releve,
                dernier_releve,
                point,
                surface,
                source {
                  name
                },
                createdAt,
                updatedAt
              }
            }
          `
    }).valueChanges;
  }

}