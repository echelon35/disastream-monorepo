import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthentificationApi } from './Services/AuthentificationApi.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from './Shared/Shared.module';
import { AuthStore } from './Store/auth/auth.store';
import { UserStore } from './Store/user/user.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SharedModule, RouterLink, RouterLinkActive]
})
export class App {

  env = environment;
  appName: string = this.env.settings.appName;
  protected urlsWithSidebar = ['/dashboard', '/profile', '/admin'];

  title = this.appName;

  isSidebarOpen = false;

  protected readonly route = inject(Router);
  protected readonly authStore = inject(AuthStore);
  protected readonly userStore = inject(UserStore);

  get isAdmin(): boolean {
    const user = this.userStore.user();
    return !!(user && user.roles && user.roles.some((r: any) => r.name === 'Admin'));
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}
