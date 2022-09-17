import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-showclass',
  templateUrl: './showclass.component.html',
  styleUrls: ['./showclass.component.css']
})
export class ShowclassComponent implements OnInit {

  constructor( public dialRef: MatDialogRef<ShowclassComponent>, @Inject(MAT_DIALOG_DATA) public data: any ) { }

  ngOnInit(): void {
  }

}
