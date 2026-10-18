import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CrearClaseComponent } from '../dialogs/crear-clase/crear-clase.component';
import { AreaEventosService, ClaseCreada } from '../services/area-eventos.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { filter } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecureStorageService } from '../services/secure-storage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  bandLogeo: boolean = false;
  bandAreaTrabajo: boolean = false;
  esAdmin: boolean = false;
  idProject: number = 0;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService,
    private http: HttpClient,
    private storage: SecureStorageService,
    private areaEventos: AreaEventosService
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.bandLogeo = status;
      this.esAdmin = this.storage.getItem('is_admin') === '1';
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Verificamos si la URL actual contiene 'area-de-trabajo'
        if (event.url.includes('area-de-trabajo')) {
          this.bandAreaTrabajo = true;
          // Leemos del sessionStorage (LO NUEVO)
          const id = this.storage.getItem('Id_Proyecto');
          this.idProject = id ? Number(id) : 0;
        } else {
          this.bandAreaTrabajo = false;
        }
      });
  }

  cerrarSesion() {
    const token = this.storage.getItem('token');
    
    // Preparamos la cabecera con la identificación
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}` 
    });
    this.http
      .post(`${environment.apiUrl}api/logout/`, { motivo: 'manual' }, { headers: headers })
      .subscribe({
        next: () => this.authService.logout(),
        error: () => this.authService.logout(), 
      });
  }

  abrirCrearClase() {
    // Editor UML: tarjeta de la clase + código generado en vivo
    const dialogRef = this.dialog.open<CrearClaseComponent, unknown, ClaseCreada | undefined>(CrearClaseComponent, {
      width: '92vw',
      maxWidth: '1280px',
      height: '86vh',
      panelClass: 'dialogo-sin-relleno',
    });
    dialogRef.afterClosed().subscribe((creada) => {
      // El área de trabajo recarga el diagrama y abre el archivo de la clase nueva
      if (creada) this.areaEventos.notificarClaseCreada(creada);
    });
  }

  irAlHome() {
    this.router.navigate(['/home']);
  }
}
