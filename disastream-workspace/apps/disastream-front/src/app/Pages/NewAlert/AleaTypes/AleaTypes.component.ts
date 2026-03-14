import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable, Subscription } from "rxjs";
import { AleaCategoryDto } from "src/app/DTO/AleaCategory.dto";
import { Alea } from "src/app/Model/Alea";
import { Alert } from "src/app/Model/Alert";
import { PublicApiService } from "src/app/Services/PublicApi.service";
import { ToastrService } from "src/app/Shared/Services/Toastr.service";
import { environment } from "src/environments/environment";

export class AleaVM {
    alea: Alea;
    selected = false;

    constructor(alea: Alea) {
        this.alea = alea;
    }
}

export class AleaCategoryVM {
    category = "";
    aleas: AleaVM[] = [];
}

@Component({
    selector: "app-alea-types",
    templateUrl: './AleaTypes.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule]
})
export class AleaTypesComponent implements OnInit, OnDestroy {

    #env = environment;
    protected s3BasePath = this.#env.settings.s3_bucket;
    public categories: AleaCategoryVM[] = [];
    public selectedAleaTypes: Alea[] = [];

    private aleaTypeAlertSubscription!: Subscription;
    @Input() loadingAlert!: Observable<Alert>;

    @Output() aleaChange = new EventEmitter<Alea[]>();
    @Output() completeStep = new EventEmitter<string>();

    constructor(private readonly publicApiService: PublicApiService, private readonly toastrService: ToastrService) {
        this.getAleas();
    }

    ngOnInit(): void {
        this.aleaTypeAlertSubscription = this.loadingAlert?.subscribe((alert) => {
            console.log(alert);
            this.selectedAleaTypes = alert.aleas;
            this.categories.forEach(item => item.aleas.forEach(aleaVM => {
                if (this.selectedAleaTypes.find(alea => alea.name == aleaVM.alea.name)) {
                    aleaVM.selected = true;
                }
            }))
        });
    }

    ngOnDestroy() {
        this.aleaTypeAlertSubscription?.unsubscribe();
    }

    getAleas() {
        this.publicApiService.getAleasByCategory().subscribe((v) => {
            const aleasByCategory: AleaCategoryVM[] = [];
            v.forEach((item) => {
                const aleaCategoryDto = item as AleaCategoryDto;
                if (!aleasByCategory.find((cat) => aleaCategoryDto.category_name == (cat as AleaCategoryVM).category)) {
                    aleasByCategory.push({
                        category: aleaCategoryDto.category_name,
                        aleas: [{
                            alea: {
                                id: aleaCategoryDto.alea_id,
                                name: aleaCategoryDto.alea_name,
                                label: aleaCategoryDto.alea_label,
                            },
                            selected: false,
                        }]
                    })
                }
                else {
                    aleasByCategory.find((cat) => (cat as AleaCategoryVM).category == aleaCategoryDto.category_name)?.aleas.push({
                        alea: {
                            id: aleaCategoryDto.alea_id,
                            name: aleaCategoryDto.alea_name,
                            label: aleaCategoryDto.alea_label,
                        },
                        selected: false,
                    });
                }
            })
            this.categories = aleasByCategory;
        })
    }

    complete() {
        this.selectedAleaTypes = [];
        this.categories.forEach(item => item.aleas.forEach(aleaVM => {
            if (aleaVM.selected) {
                this.selectedAleaTypes.push(aleaVM.alea);
            }
        }))
        this.aleaChange.emit(this.selectedAleaTypes);
    }

    selectAlea(alea: AleaVM) {
        alea.selected = !alea.selected;
        this.complete();
    }
}