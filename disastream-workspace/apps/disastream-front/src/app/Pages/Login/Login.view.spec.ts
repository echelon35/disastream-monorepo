import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginView } from './Login.view';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { SeoService } from 'src/app/Services/Seo.service';
import { Picture, RandomPictureService } from 'src/app/Shared/Services/RandomPicture.service';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { AuthStore } from 'src/app/Store/auth/auth.store';
import { of } from 'rxjs';

describe('LoginView', () => {
    let component: LoginView;
    let fixture: ComponentFixture<LoginView>;

    let mockSeoService: any;
    let mockAuthService: any;
    let mockRandomPictureService: any;
    let mockToastrService: any;
    let mockRouter: any;
    let mockActivatedRoute: any;
    let mockAuthStore: any;

    beforeEach(async () => {
        mockSeoService = jasmine.createSpyObj('SeoService', ['generateTags']);
        mockAuthService = jasmine.createSpyObj('AuthentificationApi', ['googleLogin']);
        mockRandomPictureService = {
            getPictureRandom: jasmine.createSpy('getPictureRandom').and.returnValue({
                path: 'test-path.jpg',
                alt: 'test-alt',
                author: 'test-author',
                authorLink: 'test-link'
            } as Picture)
        };
        mockToastrService = jasmine.createSpyObj('ToastrService', ['error']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockActivatedRoute = {
            snapshot: {
                queryParamMap: {
                    get: jasmine.createSpy('get').and.returnValue(null)
                }
            }
        };
        mockAuthStore = jasmine.createSpyObj('AuthStore', ['login']);

        await TestBed.configureTestingModule({
            imports: [LoginView, ReactiveFormsModule],
            providers: [
                { provide: SeoService, useValue: mockSeoService },
                { provide: AuthentificationApi, useValue: mockAuthService },
                { provide: RandomPictureService, useValue: mockRandomPictureService },
                { provide: ToastrService, useValue: mockToastrService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: AuthStore, useValue: mockAuthStore },
                FormBuilder
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LoginView);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(mockSeoService.generateTags).toHaveBeenCalled();
        expect(mockRandomPictureService.getPictureRandom).toHaveBeenCalled();
    });

    it('should initialize with invalid form', () => {
        expect(component.loginForm.valid).toBeFalse();
        expect(component.loginForm.get('mail')?.hasError('required')).toBeTrue();
        expect(component.loginForm.get('password')?.hasError('required')).toBeTrue();
    });

    it('should validate email format', () => {
        const mailControl = component.loginForm.get('mail');
        mailControl?.setValue('invalid-email');
        expect(mailControl?.hasError('email')).toBeTrue();

        mailControl?.setValue('valid@email.com');
        expect(mailControl?.hasError('email')).toBeFalse();
    });

    it('should be valid when form is filled correctly', () => {
        component.loginForm.patchValue({
            mail: 'test@example.com',
            password: 'password123'
        });
        expect(component.loginForm.valid).toBeTrue();
    });

    it('should call authStore.login on connect', () => {
        component.loginForm.patchValue({
            mail: 'test@example.com',
            password: 'password123'
        });
        component.connect();
        expect(mockAuthStore.login).toHaveBeenCalledWith({
            mail: 'test@example.com',
            password: 'password123'
        });
    });

    it('should call authService.googleLogin on googleConnect', () => {
        component.googleConnect();
        expect(mockAuthService.googleLogin).toHaveBeenCalled();
    });

    it('should show error toast if error query param exists', () => {
        // Re-configure TestBed for this specific test to change mock return value
        TestBed.resetTestingModule();
        mockActivatedRoute.snapshot.queryParamMap.get.and.returnValue('Some Error');

        TestBed.configureTestingModule({
            imports: [LoginView, ReactiveFormsModule],
            providers: [
                { provide: SeoService, useValue: mockSeoService },
                { provide: AuthentificationApi, useValue: mockAuthService },
                { provide: RandomPictureService, useValue: mockRandomPictureService },
                { provide: ToastrService, useValue: mockToastrService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: AuthStore, useValue: mockAuthStore },
                FormBuilder
            ]
        });

        fixture = TestBed.createComponent(LoginView);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(mockToastrService.error).toHaveBeenCalledWith('Some Error');
    });

});
