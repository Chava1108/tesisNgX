import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AreaDeTrabajoComponent } from './area-de-trabajo/area-de-trabajo.component';
import { AgregarComponentComponent } from './agregar-component/agregar-component.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RealizarTestComponent } from './realizar-test/realizar-test.component';
import { HacerExamenComponent } from './hacer-examen/hacer-examen.component';
import { VisorCodigoComponent } from './visor-codigo/visor-codigo.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard] },
  { path: 'realizar-test', component: RealizarTestComponent, canActivate: [AdminGuard] },
  { path: 'hacer-examen', component: HacerExamenComponent, canActivate: [AuthGuard] },
  { path: 'visor-codigo', component: VisorCodigoComponent, canActivate: [AdminGuard] },
  { path: 'area-de-trabajo.component',component:AreaDeTrabajoComponent, canActivate: [AuthGuard]},
  { path: 'agregar-componente.component',component:AgregarComponentComponent},
  { path: 'register', component:RegisterComponent },
  { path: 'login', component: LoginComponent},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
