export class Source {
    name: string;
    address: string;

    constructor(obj?: any) {
        if (obj) {
            Object.assign(this, obj);
        }
    }
}