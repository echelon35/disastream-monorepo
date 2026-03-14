export class User {
    avatar = "";
    firstname = "";
    lastname = "";
    mail = "";
    username = "";
    roles: { id: number, name: string }[] = [];
}