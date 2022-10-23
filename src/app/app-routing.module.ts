import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AreaDeTrabajoComponent } from './area-de-trabajo/area-de-trabajo.component';
import { AgregarComponentComponent } from './agregar-component/agregar-component.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: 'area-de-trabajo.component',component:AreaDeTrabajoComponent},
  { path: 'agregar-componente.component',component:AgregarComponentComponent},
  { path: 'register-component.component', component:RegisterComponent },
  { path: 'login', component: LoginComponent},
  { path: '', pathMatch: 'full', redirectTo: 'login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
