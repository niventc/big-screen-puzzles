
export class Player {    
    // This is the private id, only the user should ever see this
    public id: string;
    // This is the public id, other people can see this
    public publicId: string;
    public type = "player";
    public name: string;
    public colour: string;
}
