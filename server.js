const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Crear carpeta uploads si no existe
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function(req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + extension);
    }
});

// Validación de tipo de archivo
function fileFilter(req, file, cb) {

    const permitidos = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif"
    ];

    if (permitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten imágenes JPG, JPEG, PNG o GIF"));
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Mostrar imágenes subidas
app.use("/uploads", express.static(UPLOAD_DIR));

// Ruta de subida
app.post("/upload", upload.single("foto"), function(req, res) {

    if (!req.file) {
        return res.status(400).json({
            ok: false,
            mensaje: "No se recibió ninguna imagen"
        });
    }

    res.status(201).json({
        ok: true,
        mensaje: "Imagen subida correctamente",
        archivo: req.file.filename,
        ruta: "/uploads/" + req.file.filename
    });
});

// Manejo de errores
app.use(function(err, req, res, next) {

    if (err instanceof multer.MulterError) {

        return res.status(400).json({
            ok: false,
            mensaje: "El archivo supera los 5 MB"
        });
    }

    if (err) {

        return res.status(415).json({
            ok: false,
            mensaje: err.message
        });
    }

    next();
});

app.listen(PORT, function() {
    console.log("Servidor funcionando en http://localhost:" + PORT);
});
