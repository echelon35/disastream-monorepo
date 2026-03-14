import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplaydatePipe } from './DisplayDate/displaydate.pipe';



@NgModule({
  declarations: [
    DisplaydatePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DisplaydatePipe
  ]
})
export class PipeModule { 
  static forRoot() {
    return {
        ngModule: PipeModule,
        providers: [],
    };
 }
}
