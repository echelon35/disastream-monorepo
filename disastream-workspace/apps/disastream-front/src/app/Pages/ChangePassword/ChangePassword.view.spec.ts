import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePasswordView } from './ChangePassword.view';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { StrongPasswordRegx } from 'src/app/Utils/Const/StrongPasswordRegex';

describe('ChangePasswordView', () => {
    let component: ChangePasswordView;
    let fixture: ComponentFixture<ChangePasswordView>;

    let mockAuthService: any;
    let mockToastrService: any;
    let mockRouter: any;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        mockAuthService = jasmine.createSpyObj('AuthentificationApi', ['changePassword']);
        mockToastrService = jasmine.createSpyObj('ToastrService', ['error']);
        mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
        mockActivatedRoute = {
            snapshot: {
                queryParamMap: {
                    get: jasmine.createSpy('get').and.returnValue('test-token')
                }
            }
        };

        await TestBed.configureTestingModule({
            imports: [ChangePasswordView, ReactiveFormsModule, CommonModule],
            providers: [
                { provide: AuthentificationApi, useValue: mockAuthService },
                { provide: ToastrService, useValue: mockToastrService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                FormBuilder
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ChangePasswordView);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.token).toBe('test-token');
    });

    it('should initialize with invalid form', () => {
        expect(component.passwordForm.valid).toBeFalse();
        expect(component.passwordFormField?.hasError('required')).toBeTrue();
        expect(component.confirmPasswordFormField?.hasError('required')).toBeTrue();
    });

    it('should validate password complexity', () => {
        const passwordControl = component.passwordFormField;

        // Too short
        passwordControl?.setValue('Ab1');
        expect(passwordControl?.hasError('pattern')).toBeTrue();

        // No uppercase
        passwordControl?.setValue('password123');
        expect(passwordControl?.hasError('pattern')).toBeTrue();

        // No lowercase
        passwordControl?.setValue('PASSWORD123');
        expect(passwordControl?.hasError('pattern')).toBeTrue();

        // No digit
        passwordControl?.setValue('Password');
        expect(passwordControl?.hasError('pattern')).toBeTrue();

        // Valid
        passwordControl?.setValue('StrongPass1');
        expect(passwordControl?.hasError('pattern')).toBeFalse();
    });

    it('should not submit if form is invalid', () => {
        component.onSubmit();
        expect(mockAuthService.changePassword).not.toHaveBeenCalled();
    });

    it('should not submit if passwords do not match', () => {
        component.passwordForm.patchValue({
            password: 'StrongPass1',
            confirm_password: 'DifferentPass1'
        });

        component.onSubmit();

        expect(component.errors).toBe('La confirmation doit-être identique au mot de passe.');
        expect(mockAuthService.changePassword).not.toHaveBeenCalled();
    });

    it('should call changePassword on valid submission', () => {
        mockAuthService.changePassword.and.returnValue(of({}));

        component.passwordForm.patchValue({
            password: 'StrongPass1',
            confirm_password: 'StrongPass1'
        });

        component.onSubmit();

        expect(mockAuthService.changePassword).toHaveBeenCalledWith({
            password: 'StrongPass1',
            token: 'test-token'
        });
        expect(component.message).toContain('réinitialisé avec succès');
        expect(component.errors).toBe('');
    });

    it('should handle API error on submission', () => {
        mockAuthService.changePassword.and.returnValue(throwError(() => new Error('API Error')));

        component.passwordForm.patchValue({
            password: 'StrongPass1',
            confirm_password: 'StrongPass1'
        });

        component.onSubmit();

        expect(mockAuthService.changePassword).toHaveBeenCalled();
        expect(mockToastrService.error).toHaveBeenCalled();
    });

    it('should navigate to login on goLogin', () => {
        component.goLogin();
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
    });

});
