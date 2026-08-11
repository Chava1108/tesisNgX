const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4200;

// Servir archivos estáticos desde dist/tesis
app.use(express.static(path.join(__dirname, 'dist/tesis')));

// Para Angular routing - redirigir todas las rutas a index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/tesis/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor frontend corriendo en puerto ${PORT}`);
});
