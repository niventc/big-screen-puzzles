import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
    
    public getClientId(): string {
        // return undefined;
        return window.localStorage.getItem("clientId");
    }

    public setClientId(clientId: string): void {
        window.localStorage.setItem("clientId", clientId);
    }

}