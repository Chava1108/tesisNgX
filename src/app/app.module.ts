import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AreaDeTrabajoComponent } from './area-de-trabajo/area-de-trabajo.component';
import { AgregarComponentComponent } from './agregar-component/agregar-component.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import {MatSidenavModule} from '@angular/material/sidenav'; 
import {MatListModule} from '@angular/material/list'; 
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatIconModule} from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { FormularioComponent } from './dialogs/formulario/formulario.component';
import { ShowclassComponent } from './dialogs/showclass/showclass.component';
import { EditarFormularioComponent } from './dialogs/editar-formulario/editar-formulario.component';
import { LoginComponent } from './login/login.component'; 
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FormProyectComponent } from './dialogs/form-proyect/form-proyect.component';
import { ConfirmComponent } from './dialogs/confirm/confirm.component';
import { ErrorComponent } from './dialogs/error/error.component'; 

@NgModule({
  declarations: [
    AppComponent,
    AreaDeTrabajoComponent,
    AgregarComponentComponent,
    FormularioComponent,
    ShowclassComponent,
   EditarFormularioComponent,
   LoginComponent,
   RegisterComponent,
   HomeComponent,
   NavbarComponent,
   FormProyectComponent,
   ConfirmComponent,
   ErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    HttpClientModule,
    NgxGraphModule,
    MatButtonModule,
    MatDialogModule
  ],
  providers: [
    
  ],
  bootstrap: [AppComponent],
  entryComponents:[FormularioComponent],
})
export class AppModule { }
