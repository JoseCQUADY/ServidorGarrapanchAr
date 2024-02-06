import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref ,uploadBytes} from "firebase/storage";

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const storageFB = getStorage();
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

app.use(cors({origin: '*'}));

app.use('/static', express.static('Files'));
// Configuración de Multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Files/');
    },
    filename: function (req, file, cb) {
        cb(null, req.body.filename + path.extname(file.originalname));
    }
});

app.get('/api', (req, res) => {
    res.send('Hello World');
});

const upload = multer({ storage: storage });

// Ruta para manejar la subida de archivos
app.post('/upload', upload.single('file'), (req, res) => {
    
    const filename = req.body.filename;
    const filepath = path.join('Files/', `${filename}${path.extname(req.file.originalname)}`);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const storageRef = ref(storageFB, filepath);
    const uploadFB = uploadBytes(storageRef, req.file.buffer);
    console.log(fileExtension);
    // if (!fs.existsSync('Files')) {
    //     fs.mkdirSync('Files', { recursive: true });
    // }
    // fs.renameSync(req.file.path, filepath);
    
    const fileType = getFileType(fileExtension);
    console.log(fileType);
    res.json({
        filename: `${filename}${path.extname(req.file.originalname)}`,
        fileType: fileType,
        success: true
    });

});

// Ruta para obtener la lista de archivos
app.post('/api/fetch_files', (req, res) => {
    const folderName = 'Files';
    const fileData = fs.readdirSync(folderName);

    const imgExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const vidExtensions = ['mp4'];
    const objExtensions = ['gltf', 'glb'];

    let output = '<div class="row row-cols-1 row-cols-md-3 g-4">';

    fileData.forEach((file) => {
        if (file === '.' || file === '..') return;

        const pathToFile = path.join(folderName, file);
        const extension = path.extname(pathToFile).toLowerCase();

        let file_type = '';
        let fl_type = '';
        let cardContent = '';

        if (imgExtensions.includes(extension)) {
            fl_type = 'img';
            file_type = 'Imagen';
            cardContent = `<img src="${pathToFile}" class="card-img-top" alt="imagen">`;
        } else if (vidExtensions.includes(extension)) {
            fl_type = 'video';
            file_type = 'Video';
            cardContent = `
                <div class="ratio ratio-16x9">
                    <video controls>
                        <source src="${pathToFile}" type="video/mp4">
                        Tu navegador no soporta la etiqueta video.
                    </video>
                </div>`;
        } else if (objExtensions.includes(extension)) {
            fl_type = '3DObj';
            file_type = 'Objeto 3D';
            cardContent = `
                <div id="div3D">
                    <model-viewer 
                        src="${pathToFile}"
                        camera-controls 
                        auto-rotate 
                        disable-zoom>
                    </model-viewer>
                </div>`;
        }

        output += `
            <div class="col">
                <div class="card h-100 text-center">
                    ${cardContent}
                    <div class="card-body">
                        <h5 class="card-title">Archivo: ${file_type}</h5>
                        <button 
                            name="select_file" 
                            type="button" 
                            class="select_file btn btn-primary" 
                            id="${pathToFile}"
                            value="${fl_type}">
                            Seleccionar
                        </button>
                    </div>
                </div>
            </div>`;
    });

    output += '</div>';
    res.send(output);
});

function getFileType(extension) {
    const imgExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const vidExtensions = ['.mp4'];
    const objExtensions = ['.gltf', '.glb'];

    if (imgExtensions.includes(extension)) {
        return 'img';
    } else if (vidExtensions.includes(extension)) {
        return 'video';
    } else if (objExtensions.includes(extension)) {
        return '3DObj';
    } else {
        return 'unknown';
    }
}


app.get('/list-files', (req, res) => {
    const files = fs.readdirSync(path.join(__dirname, 'Files'));
    res.json({ files });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
