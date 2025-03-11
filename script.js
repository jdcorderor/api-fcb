document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos el formulario de búsqueda
    const searchForm = document.getElementById('search-form');

    if (searchForm) {
        searchForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita que la página se recargue

            // Capturamos el valor ingresado en el input
            const query = document.getElementById('input').value.trim();
            if (!query) return alert('Ingrese un término de búsqueda.');

            try {
                // Realizamos la petición a la API
                const response = await fetch(`http://localhost:3000/?query=${query}`);
                if (!response.ok) throw new Error('Error al obtener datos.');

                const data = await response.json();

                // Verificamos si hay resultados
                if (data.results.length > 0) {
                    localStorage.setItem('results', JSON.stringify(data.results));
                    window.location.href = 'results.html';
                } else {
                    mostrarMensajeError('No se encontraron coincidencias. Intente nuevamente.');
                }
            } catch (error) {
                console.error('Error en la búsqueda:', error);
            }
        });
    }

    // Manejamos el formulario de registro
    const registrationForm = document.getElementById('registration-form');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Capturamos los valores del formulario
            const item = obtenerDatosFormulario();

            try {
                const response = await fetch('http://localhost:3000', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item),
                });

                if (!response.ok) throw new Error('Error al registrar los datos.');

                const data = await response.json();
                console.log('Nuevo registro añadido:', data);
                window.location.href = 'main.html';
            } catch (error) {
                console.error('Error al registrar:', error);
            }
        });
    }

    // Si estamos en 'results.html', mostramos los resultados almacenados
    if (window.location.pathname.endsWith('results.html')) {
        mostrarResultados();
    }

    // Si estamos en 'editor.html', precargamos los datos para editar
    if (window.location.pathname.endsWith('editor.html')) {
        cargarDatosEdicion();
    }
});

// Muestra un mensaje de error en pantalla.
function mostrarMensajeError(mensaje) {
    const contentElement = document.getElementById('not-found');
    contentElement.innerHTML = `<p>${mensaje}</p>`;
}

// Obtiene los datos ingresados en el formulario de registro o edición.
function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById('name').value.trim(),
        edad: parseInt(document.getElementById('age').value),
        nacionalidad: document.getElementById('nationality').value.trim(),
        dorsal: parseInt(document.getElementById('dorsal').value),
        posicion: document.getElementById('position').value.trim(),
        estatura: parseFloat(document.getElementById('height').value),
        valormercado: document.getElementById('marketvalue').value.trim(),
        imagen: document.getElementById('image').value.trim(),
    };
}

// Muestra los resultados almacenados en localStorage en 'results.html'.
function mostrarResultados() {
    const resultsContainer = document.getElementById('results-container');
    const results = JSON.parse(localStorage.getItem('results'));

    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p>No hay resultados disponibles.</p>';
        return;
    }

    results.forEach((result) => {
        const resultElement = document.createElement('div');
        resultElement.innerHTML = `
            <img src="${result.imagen}" loading="lazy">
            <h3>${result.nombre}</h3>
            <p>Edad: ${result.edad}<br>Nacionalidad: ${result.nacionalidad}<br>
               Dorsal: ${result.dorsal}<br>Posición: ${result.posicion}<br>
               Estatura: ${result.estatura}m<br>Valor de Mercado: ${result.valormercado}</p>
            <div class="buttonscontainer">
                <button class="buttons edit" data-id="${result.id}">Editar</button>
                <button class="buttons delete" data-id="${result.id}">Eliminar</button>
            </div>
            <hr>
        `;
        resultsContainer.appendChild(resultElement);
    });

    agregarEventosBotones();
}

// Agrega eventos a los botones de editar y eliminar.
function agregarEventosBotones() {
    document.querySelectorAll('.edit').forEach((button) => {
        button.addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id');
            const results = JSON.parse(localStorage.getItem('results'));
            const record = results.find((result) => result.id === id);

            localStorage.setItem('information', JSON.stringify(record));
            window.location.href = 'editor.html';
        });
    });

    document.querySelectorAll('.delete').forEach((button) => {
        button.addEventListener('click', async (event) => {
            const id = event.target.getAttribute('data-id');
            try {
                const response = await fetch(`http://localhost:3000/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error al eliminar el registro.');

                console.log(`Registro con ID ${id} eliminado.`);
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar:', error);
            }
        });
    });
}


// Carga los datos del jugador a editar en el formulario de 'editor.html'.

function cargarDatosEdicion() {
    document.addEventListener('DOMContentLoaded', () => {
        const playerData = localStorage.getItem('information');
        if (!playerData) return console.error('Registro no encontrado');

        const player = JSON.parse(playerData);
        document.getElementById('name').value = player.nombre || '';
        document.getElementById('age').value = player.edad || '';
        document.getElementById('nationality').value = player.nacionalidad || '';
        document.getElementById('dorsal').value = player.dorsal || '';
        document.getElementById('position').value = player.posicion || '';
        document.getElementById('height').value = player.estatura || '';
        document.getElementById('marketvalue').value = player.valormercado || '';
        document.getElementById('image').value = player.imagen || '';

        manejarEdicion(player.id);
    });
}


function manejarEdicion(id) {
    const editForm = document.getElementById('edit-form');

    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const item = obtenerDatosFormulario();
        try {
            const response = await fetch(`http://localhost:3000/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });

            if (!response.ok) throw new Error('Error al modificar el registro.');

            console.log(`Registro con ID ${id} editado.`);
            window.location.href = 'main.html';
        } catch (error) {
            console.error('Error en la edición:', error);
        }
    });
}
