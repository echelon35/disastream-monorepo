
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationView } from './Authentification.view';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { Router } from '@angular/router';
import { SeoService } from 'src/app/Services/Seo.service';
import { RandomPictureService, Picture } from 'src/app/Shared/Services/RandomPicture.service';
import { UserStore } from 'src/app/Store/user/user.store';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { User } from 'src/app/Model/User';

describe('AuthenticationView', () => {
    let component: AuthenticationView;
    let fixture: ComponentFixture<AuthenticationView>;

    let mockAuthApi: any;
    let mockRouter: any;
    let mockSeoService: any;
    let mockRandomPictureService: any;
    let mockUserStore: any;

    beforeEach(async () => {
        mockAuthApi = {
            register: jasmine.createSpy('register').and.returnValue(of({ mail: 'test@test.com' } as User)),
            googleSignin: jasmine.createSpy('googleSignin')
        };

        mockRouter = {
            navigateByUrl: jasmine.createSpy('navigateByUrl')
        };

        mockSeoService = {
            generateTags: jasmine.createSpy('generateTags')
        };

        mockRandomPictureService = {
            getPictureRandom: jasmine.createSpy('getPictureRandom').and.returnValue({
                path: 'test-path',
                alt: 'test-alt',
                author: 'test-author',
                authorLink: 'test-link'
            } as Picture)
        };

        mockUserStore = {}; // Minimal mock as it's not heavily used in the view logic shown

        await TestBed.configureTestingModule({
            imports: [AuthenticationView, ReactiveFormsModule],
            providers: [
                { provide: AuthentificationApi, useValue: mockAuthApi },
                { provide: Router, useValue: mockRouter },
                { provide: SeoService, useValue: mockSeoService },
                { provide: RandomPictureService, useValue: mockRandomPictureService },
                { provide: UserStore, useValue: mockUserStore },
                FormBuilder
            ]
        })
            .overrideComponent(AuthenticationView, {
                remove: {
                    providers: [AuthentificationApi, Router, SeoService, RandomPictureService, FormBuilder, UserStore]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(AuthenticationView);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form and services', () => {
        expect(component.registerForm).toBeDefined();
        expect(component.picture).toBeDefined();
        expect(mockSeoService.generateTags).toHaveBeenCalled();
        expect(mockRandomPictureService.getPictureRandom).toHaveBeenCalled();
    });

    it('should be invalid when form is empty', () => {
        expect(component.registerForm.valid).toBeFalsy();
    });

    it('should validate form fields', () => {
        const form = component.registerForm;
        const username = form.controls['username'];
        const mail = form.controls['mail'];
        const password = form.controls['password'];
        const rgpdConsent = form.controls['rgpdConsent'];

        username.setValue('');
        expect(username.valid).toBeFalsy();
        username.setValue('ab');
        expect(username.valid).toBeFalsy(); // min length 3
        username.setValue('testuser');
        expect(username.valid).toBeTruthy();

        mail.setValue('');
        expect(mail.valid).toBeFalsy();
        mail.setValue('invalid-email');
        expect(mail.valid).toBeFalsy();
        mail.setValue('test@example.com');
        expect(mail.valid).toBeTruthy();

        password.setValue('');
        expect(password.valid).toBeFalsy();
        password.setValue('weak');
        expect(password.valid).toBeFalsy(); // Check regex
        // StrongPasswordRegx usually requires checks like: (?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}
        // Let's assume a strong password for now
        password.setValue('StrongP@ssw0rd');
        expect(password.valid).toBeTruthy();

        rgpdConsent.setValue(false);
        expect(rgpdConsent.valid).toBeFalsy();
        rgpdConsent.setValue(true);
        expect(rgpdConsent.valid).toBeTruthy();
    });

    it('should submit form when valid', () => {
        const form = component.registerForm;
        const email = 'test@example.com';
        form.controls['username'].setValue('testuser');
        form.controls['mail'].setValue(email);
        form.controls['password'].setValue('StrongP@ssw0rd');
        form.controls['rgpdConsent'].setValue(true);

        mockAuthApi.register.and.returnValue(of({ mail: email } as User));

        expect(form.valid).toBeTruthy();

        component.onSubmit();

        expect(mockAuthApi.register).toHaveBeenCalledWith(form.value);
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(`/?mail=${email}`);
    });

    it('should set error message on registration failure', () => {
        mockAuthApi.register.and.returnValue(throwError(() => ({ error: { message: 'Registration failed' } })));

        const form = component.registerForm;
        form.controls['username'].setValue('testuser');
        form.controls['mail'].setValue('test@example.com');
        form.controls['password'].setValue('StrongP@ssw0rd');
        form.controls['rgpdConsent'].setValue(true);

        component.onSubmit();

        expect(mockAuthApi.register).toHaveBeenCalled();
        expect(component.errorMessage).toBe('Registration failed');
    });

    it('should assume google sigin on authenticate', () => {
        component.authenticate();
        expect(mockAuthApi.googleSignin).toHaveBeenCalled();
    });

});
