import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";

@Component({
    templateUrl: './Pricing.view.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PricingView {
  isSidebarOpen = false;
  isAuth = false;
  isAuthenticated$: Observable<boolean>;

  protected readonly router = inject(Router);

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}