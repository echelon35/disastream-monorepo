import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { Router } from '@angular/router';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { UserStore } from '../user/user.store';
import { of, throwError } from 'rxjs';
import { UserLoginDto } from 'src/app/DTO/UserLogin.dto';
import { TokenDto } from 'src/app/DTO/token.dto';

describe('AuthStore', () => {
    let store: InstanceType<typeof AuthStore>;
    let mockAuthService: any;
    let mockRouter: any;
    let mockToastrService: any;
    let mockUserStore: any;

    beforeEach(() => {
        mockAuthService = jasmine.createSpyObj('AuthentificationApi', ['login', 'checkExpiration']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl', 'parseUrl'], { url: '/' });
        mockToastrService = jasmine.createSpyObj('ToastrService', ['error']);
        mockUserStore = jasmine.createSpyObj('UserStore', ['getUser']);

        // Mock localStorage
        spyOn(localStorage, 'getItem').and.returnValue(null);
        spyOn(localStorage, 'setItem');
        spyOn(localStorage, 'removeItem');

        TestBed.configureTestingModule({
            providers: [
                AuthStore,
                { provide: AuthentificationApi, useValue: mockAuthService },
                { provide: Router, useValue: mockRouter },
                { provide: ToastrService, useValue: mockToastrService },
                { provide: UserStore, useValue: mockUserStore },
            ]
        });

        store = TestBed.inject(AuthStore);
    });

    it('should initialize with default state', () => {
        expect(store.token()).toBeNull();
        expect(store.isAuthenticated()).toBeFalse();
        expect(store.loading()).toBeFalse();
        expect(store.error()).toBeNull();
    });

    it('should login successfully', () => {
        const loginDto: UserLoginDto = { mail: 'test@test.com', password: 'password' };
        const tokenResponse: TokenDto = { access_token: 'valid-token' };

        mockAuthService.login.and.returnValue(of(tokenResponse));
        const mockUrlTree = { queryParams: {} };
        mockRouter.parseUrl.and.returnValue(mockUrlTree);
        mockRouter.navigateByUrl.and.returnValue(Promise.resolve(true));

        store.login(loginDto);

        expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
        expect(localStorage.setItem).toHaveBeenCalledWith('auth-token', 'valid-token');
        expect(store.token()).toBe('valid-token');
        expect(store.isAuthenticated()).toBeTrue();
        expect(store.loading()).toBeFalse();
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should handle login error', () => {
        const loginDto: UserLoginDto = { mail: 'test@test.com', password: 'password' };
        const errorMsg = 'Invalid credentials';

        mockAuthService.login.and.returnValue(throwError(() => new Error(errorMsg)));

        store.login(loginDto);

        expect(store.isAuthenticated()).toBeFalse();
        expect(store.loading()).toBeFalse();
        expect(store.error()).toBe(errorMsg);
        expect(mockToastrService.error).toHaveBeenCalledWith(errorMsg);
    });

    it('should logout successfully', () => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        store.logout();

        expect(localStorage.removeItem).toHaveBeenCalledWith('auth-token');
        expect(store.token()).toBeNull();
        expect(store.isAuthenticated()).toBeFalse();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should check token validity successfully', () => {
        mockAuthService.checkExpiration.and.returnValue(of(true));

        store.checkTokenValidity('some-token');

        expect(mockAuthService.checkExpiration).toHaveBeenCalled();
        expect(store.isTokenValid()).toBeTrue();
        expect(store.isAuthenticated()).toBeTrue();
    });

    it('should handle invalid token check', () => {
        mockAuthService.checkExpiration.and.returnValue(of(false));
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        store.checkTokenValidity('expired-token');

        expect(localStorage.removeItem).toHaveBeenCalledWith('auth-token');
        expect(store.isTokenValid()).toBeFalse();
        expect(store.isAuthenticated()).toBeFalse();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], jasmine.any(Object));
    });

    it('should handle check token error', () => {
        const errorMsg = 'Network error';
        mockAuthService.checkExpiration.and.returnValue(throwError(() => new Error(errorMsg)));
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        store.checkTokenValidity('error-token');

        expect(localStorage.removeItem).toHaveBeenCalledWith('auth-token');
        expect(store.error()).toBe(errorMsg);
        expect(store.isTokenValid()).toBeFalse();
    });

});
