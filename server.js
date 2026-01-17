import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/autoefec', express.static(path.join(__dirname, 'public', 'autoefec')));

// Logging de requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Mejoras:
// 1. Validación robusta de extensiones de imagen
// 2. Limpieza automática de carpeta temporal
// 3. Logging detallado
// 4. Respuesta clara en caso de error

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.jfif'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tmpFolder = path.join(__dirname, 'public', 'autoefec', 'tmp');
    fs.mkdirSync(tmpFolder, { recursive: true });
    cb(null, tmpFolder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Tipo de archivo no permitido: ' + ext));
    }
    const name = Date.now() + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

app.post('/upload',
  upload.single('image'),
  (req, res) => {
    const marca = req.body?.marca || '';
    const modelo = req.body?.modelo || '';
    if (!marca || !modelo) {
      // Limpia archivo temporal si no hay datos válidos
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({ error: 'Marca y modelo son obligatorios para subir imagen' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió imagen'});
    }
    const marcaNorm = marca.toLowerCase().replace(/[^a-z0-9-_]/g, '').replace(/\s+/g, '-');
    const modeloNorm = modelo.toLowerCase().replace(/[^a-z0-9-_]/g, '').replace(/\s+/g, '-');
    const destFolder = path.join(__dirname, 'public', 'autoefec', `${marcaNorm}-${modeloNorm}`);
    fs.mkdirSync(destFolder, { recursive: true });
    const destPath = path.join(destFolder, req.file.filename);
    const tmpPath = req.file.path;
    try {
      fs.renameSync(tmpPath, destPath);
      const url = `/autoefec/${marcaNorm}-${modeloNorm}/${req.file.filename}`;
      console.log('✅ Guardada en:', destPath);
      console.log('🌐 URL pública:', url);
      console.log(`[UPLOAD] Imagen movida a: ${url}`);
      res.json({ url });
    } catch (err) {
      console.error('[UPLOAD] Error moviendo imagen:', err);
      // Limpia archivo temporal si falla el movimiento
      if (fs.existsSync(tmpPath)) {
        fs.unlink(tmpPath, () => {});
      }
      res.status(500).json({ error: 'Error al mover la imagen', details: err.message });
    }
  }
);

app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ error: 'Error interno del servidor', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});
