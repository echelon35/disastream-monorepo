export class AleaCategoryDto {
    alea_id: number;
    alea_name: string;
    alea_label: string;
    category_name: string;

    constructor(id: number,aname: string,alabel:string,cname:string){
        this.alea_id = id;
        this.alea_name = aname;
        this.alea_label = alabel;
        this.category_name = cname;
    }
}