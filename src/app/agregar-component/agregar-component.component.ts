import {MediaMatcher} from '@angular/cdk/layout';
import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import * as mermaid from 'mermaid';
import mermaidAPI from "mermaid/mermaidAPI";

@Component({
  selector: 'app-agregar-component',
  templateUrl: './agregar-component.component.html',
  styleUrls: ['./agregar-component.component.css']
})
export class AgregarComponentComponent implements OnDestroy {

  mobileQuery: MediaQueryList;

  //fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);
  fillerNav=[
    {name:"Home", route:"area-de-trabajo.component", icon:"home"}
  ]
  

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    mermaid.default
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  shouldRun = true;

  recargarPagina(){
    location.href="http://localhost:4200/area-de-trabajo.component"
  }
  

}
