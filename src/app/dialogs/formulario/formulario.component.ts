import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {

  constructor(public dialgRef:MatDialogRef<FormularioComponent>, @Inject(MAT_DIALOG_DATA) public message:string) { }

  ngOnInit(): void {
  }

  onClickNo(){
    this.dialgRef.close();
  }

}
