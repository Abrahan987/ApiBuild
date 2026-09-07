const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Asegurarse de que la carpeta "uploads" exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configuración de Multer: dónde y con qué nombre guardar los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Nombre único para no sobrescribir archivos con el mismo nombre
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No se recibió ningún archivo' });
  }

  const ip = req.ip || req.socket.remoteAddress;
  const caption = req.body.caption || '(sin caption)';

  console.log(`IP: ${ip} | Archivo guardado: ${req.file.filename} | Caption: ${caption}`);

  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
