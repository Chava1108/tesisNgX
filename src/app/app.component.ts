import { AfterContentInit, Component, ElementRef, OnInit, ViewChild, Renderer2 } from "@angular/core";
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import * as mermaid from 'mermaid';
import mermaidAPI from "mermaid/mermaidAPI";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  horizontalStepperForm = new FormGroup({
    clase: new FormControl('', Validators.required)
  });
  constructor(renderer2: Renderer2, private ElementRef: ElementRef) {

  }
  ngOnInit(): void {


  }

  agregarClase() {
    

  }
}
