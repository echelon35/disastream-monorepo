import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    templateUrl: './FreeMode.modal.html',
    selector: "app-free-modal",
    standalone: true,
    imports: [CommonModule]
})
export class FreeModeComponent {
  isVisible = false;

  toggleVisible() {
    this.isVisible = !this.isVisible;
  }
}