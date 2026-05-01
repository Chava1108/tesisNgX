import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormProyectComponent } from '../dialogs/form-proyect/form-proyect.component';
import { PoryectosService } from '../services/poryectos.service';
import { AuthService } from '../services/auth.service';
import { SecureStorageService } from '../services/secure-storage.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

constructor(
    public dialog: MatDialog, 
    private apis: PoryectosService, 
    private router: Router,
    private authService: AuthService,
    private storage: SecureStorageService
  ) { }
  username:any
  id:any
  proyectos:any
  esAdmin: boolean = false;
ngOnInit(): void {
    // Verificamos sesión (por seguridad extra)
    if (!this.authService.estaAutenticado()) {
      this.authService.logout(); // Si no hay datos, lo saca
      return;
    }

    const user = this.authService.obtenerUsuarioActual();
    this.username = user.username;
    this.id = user.id;
    this.esAdmin = this.storage.getItem('is_admin') === '1';

    this.obtenerProyectos();
  }

  obtenerProyectos(){
    this.apis.getProyectos(this.id).subscribe({
      next:(res:any)=>{
        this.proyectos=res
      }
    })
  }

openProyect(proyect: any) {
    this.storage.setItem("Id_Proyecto", proyect.id);
    this.storage.setItem("Nombre_Proyecto", proyect.nombre);
    this.router.navigate(['/area-de-trabajo.component']); 
  }

  openDialog(){
    const formDialog = this.dialog.open(FormProyectComponent, {
      width: '50%' ,
      height: '60%'
    });
  }

}
