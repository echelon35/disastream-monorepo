import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { UserLoginDto } from "../DTO/UserLogin.dto";
import { Observable } from "rxjs";
import { CreateUserDto } from "../DTO/CreateUser.dto";
import { User } from "../Model/User";
import { TokenDto } from "../DTO/token.dto";
import { ChangePasswordDto } from "../DTO/ChangePassword.dto";
import { Store } from '@ngrx/store';

const env = environment;
const API_URL = `${env.settings.backend}`;
const TOKEN_KEY = 'auth-token';

@Injectable({
    providedIn: 'root'
})
export class AuthentificationApi {
    private httpOptions = {};
    public user: User;

    constructor(private http: HttpClient) {
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        };
    }

    googleLogin(): void {
        window.location.href = API_URL + '/auth/google/login';
    }

    googleSignin(): void {
        window.location.href = API_URL + '/auth/google/signin';
    }

    public completeGoogleRegistration(payload: any): Observable<any> {
        return this.http.post<any>(`${API_URL}/auth/google-register/complete`, payload, this.httpOptions);
    }

    public saveToken(token: string): void {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.setItem(TOKEN_KEY, token);
    }

    public getToken(): string | null {
        const token = localStorage.getItem(TOKEN_KEY);
        return token;
    }

    public login(userDto: UserLoginDto): Observable<TokenDto> {
        return this.http.post<TokenDto>(API_URL + '/auth/login', userDto, this.httpOptions)
    }

    // isAuthenticated(): boolean {
    //     return localStorage.getItem(TOKEN_KEY) != null;
    // }

    public resend(mail: string): Observable<string> {
        return this.http.post<string>(API_URL + '/auth/resend-confirmation-email?mail=' + mail, this.httpOptions);
    }

    public resendAssociation(maId: number): Observable<string> {
        return this.http.post<string>(API_URL + '/auth/resend-confirmation-association-email?ma=' + maId, this.httpOptions);
    }

    public register(createUserDto: CreateUserDto): Observable<User> {
        return this.http.post<User>(API_URL + '/auth/signin', createUserDto, this.httpOptions)
    }

    public confirm(token: string) {
        return this.http.get<User>(API_URL + '/auth/confirm-email?token=' + token, this.httpOptions)
    }

    public confirmAssociation(token: string) {
        return this.http.get<User>(API_URL + '/auth/confirm-association?token=' + token, this.httpOptions)
    }

    public checkExpiration() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            })
        };
        return this.http.get<boolean>(API_URL + '/auth/expiration', httpOptions);
    }

    public forgotPassword(mail: string) {
        return this.http.post<boolean>(API_URL + '/auth/forgot-password?mail=' + mail, this.httpOptions);
    }

    public changePassword(changePasswordDto: ChangePasswordDto) {
        return this.http.post<boolean>(API_URL + '/auth/change-password', changePasswordDto, this.httpOptions);
    }
}
