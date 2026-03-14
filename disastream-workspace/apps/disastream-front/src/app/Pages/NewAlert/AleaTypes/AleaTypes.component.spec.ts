
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AleaTypesComponent } from './AleaTypes.component';
import { PublicApiService } from 'src/app/Services/PublicApi.service';
import { ToastrService } from 'src/app/Shared/Services/Toastr.service';
import { of, BehaviorSubject } from 'rxjs';
import { AleaCategoryDto } from 'src/app/DTO/AleaCategory.dto';
import { CommonModule } from '@angular/common';

describe('AleaTypesComponent', () => {
    let component: AleaTypesComponent;
    let fixture: ComponentFixture<AleaTypesComponent>;
    let mockPublicApiService: any;
    let mockToastrService: any;

    const mockAleas: AleaCategoryDto[] = [
        { alea_id: 1, alea_name: 'test1', alea_label: 'Test 1', category_name: 'Cat 1' },
        { alea_id: 2, alea_name: 'test2', alea_label: 'Test 2', category_name: 'Cat 1' }
    ];

    beforeEach(async () => {
        mockPublicApiService = {
            getAleasByCategory: jasmine.createSpy('getAleasByCategory').and.returnValue(of(mockAleas))
        };
        mockToastrService = jasmine.createSpyObj('ToastrService', ['success', 'error']);

        await TestBed.configureTestingModule({
            imports: [AleaTypesComponent, CommonModule],
            providers: [
                { provide: PublicApiService, useValue: mockPublicApiService },
                { provide: ToastrService, useValue: mockToastrService }
            ]
        })
            .overrideComponent(AleaTypesComponent, {
                add: { imports: [CommonModule] }
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AleaTypesComponent);
        component = fixture.componentInstance;
        component.loadingAlert = new BehaviorSubject<any>({ aleas: [] }); // Mock input
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch aleas on init', () => {
        expect(mockPublicApiService.getAleasByCategory).toHaveBeenCalled();
        expect(component.categories.length).toBeGreaterThan(0);
    });

    it('should select alea', () => {
        const aleaVM = component.categories[0].aleas[0];
        spyOn(component.aleaChange, 'emit');

        component.selectAlea(aleaVM);

        expect(aleaVM.selected).toBeTrue();
        expect(component.aleaChange.emit).toHaveBeenCalled();
    });
});
