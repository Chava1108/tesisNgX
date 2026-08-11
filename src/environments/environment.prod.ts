// La URL del backend se configura en tiempo de build o se puede usar una variable
// Para Railway, cada servicio tiene su propio dominio
export const environment = {
  production: true,
  apiUrl: 'http://169.58.110.211/' // Al usar '/api', Nginx se encargará de redirigirlo a Django automáticamente sin broncas de CORS
};
