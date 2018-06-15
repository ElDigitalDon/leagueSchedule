import { MaterialAllModule } from './material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MaterialAllModule,
  ],
  exports: [
    MaterialAllModule,
  ],
  declarations: []
})
export class SharedModule { }
