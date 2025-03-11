// Importación de módulos.
const express = require("express"); // Framework web para Node.js.
const fs = require("fs"); // Módulo que soporta la interacción con el sistema de archivos.
const cors = require("cors"); // Middleware que habilita el soporte de CORS, para permitir el acceso externo a los recursos del servidor.
const bodyParser = require("body-parser"); // Middleware que analiza el cuerpo de las solicitudes HTTP.

// Instanciamos la aplicación Express.
const app = express();

app.use(cors()); // Habilita CORS para todas las rutas de la aplicación.
app.use(bodyParser.json()); // Analiza solicitudes con el tipo de contenido 'application/json'.

// Lectura del archivo JSON.
let items = []; // Array de almacenamiento.

// Utiliza el módulo 'fs' para leer el archivo 'data.json', con codificación UTF-8.
fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
        // Si hay un error, se imprime un mensaje de error en la consola junto con el error específico.
        console.error("Error al leer el archivo de datos:", err);
        return;
    }
    try {
        // Convierte el texto leído (data) en un objeto JavaScript utilizando JSON.parse().
        items = JSON.parse(data);
        console.log("Datos cargados exitosamente.");
    } catch (parseError) {
        // Si ocurre un error durante el análisis del JSON, se captura y se imprime un mensaje de error.
        console.error("Error de carga de datos:", parseError);
    }
});

// Endpoint GET.
app.get("/", (req, res) => {
    const query = req.query.query.toLowerCase(); // Parámetro de consulta.
    // Verifica si el parámetro de consulta está vacío.
    if (!query) {
        return res.status(400).json({ error: "Error. Parámetro de consulta requerido."})
    }
    // Filtra los items según el parámetro de consulta.
    const results = items.filter(item =>
        item.nombre.toLowerCase().includes(query) ||
        item.edad.toString().includes(query) ||
        item.nacionalidad.toLowerCase().includes(query) ||
        item.dorsal.toString().includes(query) ||        
        item.posicion.toLowerCase().includes(query) ||
        item.estatura.toString().includes(query) ||
        item.valormercado.toString().includes(query)
    );
    // Retorna una respuesta con el estado 200 (OK), y un archivo JSON con los resultados de la búsqueda.
    res.status(200).json({ query: query, results: results });
});

// Endpoint POST.
app.post("/", (req, res) => {
    // Obtiene los datos del nuevo registro del cuerpo de la solicitud.
    const item = req.body;
    if (validateItem(item)) {
        // Asigna el ID al nuevo registro.
        item.id = items.length + 1;
        // Agrega el nuevo registro al array de almacenamiento.
        items.push(item);
        // Modifica el archivo 'data.json'.
        fs.writeFile("data.json", JSON.stringify(items, null, 2), (err) => {
            // Verifica si ocurrió un error.
            if (err) {
                return res.status(500).json({ error: "Error al guardar el nuevo registro." });
            }
            // Retorna una respuesta con el estado 201 (Created), y el nuevo registro en formato JSON.
            res.status(201).json(item);
        });
    } else {
        return res.status(400).json({ error: "Registro existente." });
    }
});

// Endpoint PUT.
app.put("/:id", (req, res) => {
    // Obtiene los datos del registro a modificar del cuerpo de la solicitud.
    const record = req.body;
    // Obtiene el ID del registro a modificar de la ruta de la solicitud.
    const id = parseInt(req.params.id);
    // Determina el índice del registro a modificar en el array de almacenamiento.
    const index = items.findIndex(item => item.id === id);
    // Verifica si el registro a modificar no existe.
    if (index === -1) {
        return res.status(404).json({ error: "Registro no encontrado." });
    }
    // Modifica el registro en el array de almacenamiento.
    items[index] = record;
    // Modifica el archivo 'data.json'.
    fs.writeFile("data.json", JSON.stringify(items, null, 2), (err) => {
        // Verifica si ocurrió un error.
        if (err) {
            return res.status(500).json({ error: "Error al actualizar el registro." });
        }
        // Retorna una respuesta con el estado 200 (OK), y el registro modificado en formato JSON.
        res.status(200).json(record);
    });
});

// Endpoint DELETE.
app.delete("/:id", (req, res) => {
    // Obtiene el ID del registro a eliminar de la ruta de la solicitud.
    const recordId = parseInt(req.params.id)
    // Determina el índice del registro a eliminar en el array de almacenamiento.
    const index = items.findIndex(item => item.id === recordId);
    // Verifica si el registro a eliminar no existe.
    if (index === -1) {
        return res.status(404).json({ error: "Registro no encontrado." });
    }
    // Elimina el registro del array de almacenamiento, y guarda el registro eliminado en 'deletedItem'.
    const deletedItem = items.splice(index, 1);
    // Modifica el archivo 'data.json'.
    fs.writeFile("data.json", JSON.stringify(items, null, 2), (err) => {
        // Verifica si ocurrió un error.
        if (err) {
            return res.status(500).json({ error: "Error al eliminar el registro." });
        }
        // Retorna una respuesta con el estado 200 (OK), y el registro eliminado en formato JSON.
        res.status(200).json(deletedItem[0]);
    });
});

// Escucha en el puerto 3000.
app.listen(3000, () => {
    console.log("Servidor activo en el puerto 3000.");
});

// Validación de preexistencia de items.
function validateItem(newItem) {
    const previousItems = items.filter(item =>
        item.nombre == newItem.nombre &&
        item.posicion == newItem.posicion &&
        item.dorsal == newItem.dorsal &&
        item.edad == newItem.edad &&
        item.nacionalidad == newItem.nacionalidad &&
        item.estatura == newItem.estatura &&
        item.valormercado == newItem.valormercado &&
        item.imagen == newItem.imagen
    );
    return previousItems.length === 0;
}