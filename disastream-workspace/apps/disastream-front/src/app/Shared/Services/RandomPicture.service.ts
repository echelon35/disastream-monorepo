import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

export class Picture {
    path: string;
    alt: string;
    author: string;
    authorLink: string;
}

@Injectable({
    providedIn: 'root'
})
export class RandomPictureService {

    picturesVm: Picture[];
    currentPicture: Picture;

    env = environment;
    pathBase = this.env.settings.s3_bucket;

    constructor(){
        this.picturesVm = [
            { path: `${this.pathBase}/background/avalanche.jpg`, author: 'Iris Vallejo', authorLink: 'https://pixabay.com/fr/users/witizia-261998', alt: 'Chaînes de montagnes' },
            { path: `${this.pathBase}/background/foudre.jpg`, author: 'JPlenio', authorLink: 'https://pixabay.com/fr/users/jplenio-7645255/', alt: 'Cumulonimbus' },
            { path: `${this.pathBase}/background/fireball.jpg`, author: 'Jeff_way', authorLink: 'https://pixabay.com/fr/users/jeff_way-19059328/', alt: 'Ciel étoilé' },
            { path: `${this.pathBase}/background/eruption.jpg`, author: 'kimura2', authorLink: 'https://pixabay.com/fr/users/kimura2-490872/', alt: 'Mont fuji sur fond de ciel bleu' },
            { path: `${this.pathBase}/background/hurricane.jpg`, author: 'WikiImages', authorLink: 'https://pixabay.com/fr/users/wikiimages-1897/', alt: 'Cyclone' },
            { path: `${this.pathBase}/background/landslide.jpg`, author: 'Saiful Mulia', authorLink: 'https://pixabay.com/fr/users/saifulmulia-122995/', alt: 'Trou dans le sol, doline' },
            { path: `${this.pathBase}/background/desert.jpg`, author: 'Pexels', authorLink: 'https://pixabay.com/fr/users/pexels-2286921/', alt: 'Désert de sable' },
            { path: `${this.pathBase}/background/wind.jpg`, author: 'Daniel Brachlow', authorLink: 'https://pixabay.com/fr/users/danielbrachlow-2171695/', alt: 'Moulin à vent' },
        ]
    }

    getPictureRandom(): Picture{
        const randomNb = Math.floor(Math.random() * this.picturesVm.length);
        return this.picturesVm[randomNb];
    }
}