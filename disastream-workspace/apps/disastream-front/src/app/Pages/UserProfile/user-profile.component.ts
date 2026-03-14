import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from 'src/app/Model/User';
import { AuthentificationApi } from 'src/app/Services/AuthentificationApi.service';
import { UserApiService } from 'src/app/Services/UserApiService';
import { AuthStore } from 'src/app/Store/auth/auth.store';
import { UserStore } from 'src/app/Store/user/user.store';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    providers: [UserApiService, AuthentificationApi, UserStore]
})
export class UserProfileComponent {

  user: User = new User();

  #authStore = inject(AuthStore);
  #authService = inject(AuthentificationApi);
  #userService = inject(UserApiService);
  protected readonly userStore = inject(UserStore);

  constructor(){
    this.getMyProfile();
  }

  getMyProfile(){
    this.#userService.getMyProfile().subscribe((user) => {
      this.user = user;
    })
  }

  changeAvatar(){
    console.log('Update avatar');
  }

  updateIdentity(){
    console.log('Update identity');
  }

  changePassword(){
    console.log('Change password');
  }

  logout(){
    this.#authStore.logout();
  }
}
