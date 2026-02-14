import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Importamos NavigationEnd
import { MatDialog } from '@angular/material/dialog';
import { FormularioComponent } from '../dialogs/formulario/formulario.component';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators'; // Necesario para filtrar eventos
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  bandLogeo: boolean = false;
  bandAreaTrabajo: boolean = false;
  idProject: number = 0;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.bandLogeo = status;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Verificamos si la URL actual contiene 'area-de-trabajo'
        if (event.url.includes('area-de-trabajo')) {
          this.bandAreaTrabajo = true;
          // Leemos del sessionStorage (LO NUEVO)
          const id = sessionStorage.getItem('Id_Proyecto');
          this.idProject = id ? Number(id) : 0;
        } else {
          this.bandAreaTrabajo = false;
        }
      });
  }

  cerrarSesion() {
    const token = sessionStorage.getItem('token');
    
    // Preparamos la cabecera con la identificación
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}` 
    });
    this.http
      .post('http://localhost:8000/api/logout/', { motivo: 'manual' }, { headers: headers })
      .subscribe({
        next: () => this.authService.logout(),
        error: () => this.authService.logout(), 
      });
  }

  abrirCrearClase() {
    const dialogRef = this.dialog.open(FormularioComponent, {
      width: '80%',
      height: '80%',
      data: 'Formulario',
    });
    dialogRef.afterClosed().subscribe((res) => {
      console.log(res);
      // Aquí podrías emitir un evento para recargar el diagrama si crearon una clase
    });
  }

  irAlHome() {
    this.router.navigate(['/home']);
  }
}
