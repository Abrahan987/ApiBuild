const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar carpetas y base de datos local
const uploadsDir = path.join(__dirname, 'uploads');
const dbPath = path.join(__dirname, 'db.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify([]));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// CAMBIO IMPORTANTE: La app envía a "/" (raíz), no a "/upload"
app.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error' });
  }

  const caption = req.body.caption || 'Desconocido';
  const ip = req.ip || req.socket.remoteAddress;

  // Guardar registro en db.json
  const nuevaEntrada = {
    fecha: new Date().toISOString(),
    dispositivo: caption,
    archivo: req.file.filename,
    ip: ip
  };

  const dbContent = JSON.parse(fs.readFileSync(dbPath));
  dbContent.push(nuevaEntrada);
  fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2));

  console.log(`✅ Foto de [${caption}] guardada: ${req.file.filename}`);
  res.json({ status: 'ok' });
});

// Para que no de error al entrar desde el navegador
app.get('/', (req, res) => {
  res.send('Servidor de Recuperación Activo. Esperando fotos...');
});

app.listen(PORT, () => {
  console.log(`Servidor listo en el puerto ${PORT}`);
});
