document.addEventListener('DOMContentLoaded', () => {
    // Obtiene el elemento del campo de búsqueda.
    const searchElement = document.getElementById('search-form');
    // Verifica si el elemento del campo de búsqueda existe en el DOM.
    if (searchElement) {
        searchElement.addEventListener('submit', (event) => {
            event.preventDefault(); // Previene el comportamiento por defecto (recargar la página).
            // Obtiene el valor del campo de búsqueda.
            let entrydata = document.getElementById('input').value;
            // Emite una solicitud fetch a la API, con el valor de entrada como parámetro de consulta.
            fetch(`http://localhost:3000/?query=${entrydata}`)
                .then(response => {
                    // Convierte la respuesta a formato JSON.
                    return response.json();
                })
                .then(data => {
                    // Verifica la existencia de resultados en la respuesta.
                    if (data.results.length > 0) {
                        // Almacena los resultados en 'localStorage' y redirige a la página de resultados.
                        localStorage.setItem('results', JSON.stringify(data.results));
                        window.location.href = 'results.html';
                    } else {
                        // En caso contrario, muestra un mensaje de error de búsqueda.
                        const contentElement = document.getElementById('not-found');
                        while (contentElement.firstChild) {
                            contentElement.removeChild(contentElement.firstChild);
                        }
                        const errorMessage = document.createElement('p');
                        errorMessage.textContent = 'No se encontraron coincidencias. Intente nuevamente.';
                        document.getElementById('not-found').appendChild(errorMessage);
                    }
                })
                .catch(error => {
                    // Maneja errores de la solicitud fetch.
                    console.error('Error de la solicitud fetch:', error);
                });
        });
    }

    // Obtiene el elemento del formulario de registro.
    const postFormElement = document.getElementById('registration-form');
    // Verifica si el elemento del formulario de registro existe en el DOM.
    if (postFormElement) {
        postFormElement.addEventListener('submit', (event) => {
            event.preventDefault();
            // Obtiene los valores de los campos del formulario de registro.
            const item = {
                nombre: document.getElementById('name').value,
                edad: parseInt(document.getElementById('age').value),
                nacionalidad: document.getElementById('nationality').value,
                dorsal: parseInt(document.getElementById('dorsal').value),
                posicion: document.getElementById('position').value,
                estatura: parseFloat(document.getElementById('height').value),
                valormercado: document.getElementById('marketvalue').value,
                imagen: document.getElementById('image').value
            };
            // Emite una solicitud fetch (POST) a la API, con el objeto de registro como cuerpo de la solicitud.
            fetch('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item, null, 2)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Nuevo registro añadido:', data);
            })
            .catch(error => {
                // Maneja errores de la solicitud fetch.
                console.error('Error al añadir el nuevo registro:', error);
            });
        });
    }
});

// Verifica si la ruta actual termina con 'main.html'.
if (window.location.pathname.endsWith('main.html')) {
    // Establece el foco en el campo de entrada.
    document.getElementById('input').focus();
    // Obtiene el elemento de botón de registro por su ID.
    const registrationButton = document.getElementById('registration');
    registrationButton.addEventListener('click', () => {
        // Redirige a la página 'input.html'.
        window.location.href = 'input.html';
    });
}

// Verifica si la ruta actual termina con 'results.html'.
if (window.location.pathname.endsWith('results.html')) {
    // Obtiene el elemento contenedor de resultados por su ID.
    const resultsContainer = document.getElementById('results-container');
    // Recupera los resultados de búsqueda de 'localStorage'.
    const results = JSON.parse(localStorage.getItem('results'));
    // Verifica la existencia de resultados de búsqueda.
    if (results && results.length > 0) {
        let cont = 0;
        // Recorre los resultados de búsqueda.
        results.forEach(result => {
            // Estructura e incorpora cada resultado de la búsqueda en el contenedor de resultados (individualmente).
            const resultElement = document.createElement('div');
            const imageElement = document.createElement('img');
            imageElement.src = result.imagen;
            imageElement.loading = 'lazy';
            resultElement.appendChild(imageElement);
            const nameElement = document.createElement('h3');
            nameElement.textContent = result.nombre;
            resultElement.appendChild(nameElement);
            const infoElement = document.createElement('p');
            infoElement.innerHTML = `Edad: ${result.edad}<br>Nacionalidad: ${result.nacionalidad}<br>Dorsal: ${result.dorsal}<br>Posición: ${result.posicion}
            <br>Estatura: ${result.estatura} metros<br>Valor de Mercado: ${result.valormercado}`;
            resultElement.appendChild(infoElement);
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'buttonscontainer';
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'buttons edit';
            editButton.setAttribute('data-name', result.nombre);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'buttons delete';
            deleteButton.setAttribute('data-name', result.nombre);
            buttonsContainer.append(editButton);
            buttonsContainer.append(deleteButton);
            resultElement.append(buttonsContainer);
            cont++;
            if (cont != results.length) {
                resultElement.appendChild(document.createElement('hr'));
            }
            resultsContainer.appendChild(resultElement);
        });
    }

    // Obtiene todos los elementos de botón de la clase 'edit'.
    const editButtons = document.querySelectorAll('.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Obtiene el valor del atributo 'data-name'.
            const id = event.target.getAttribute('data-name');
            // Obtiene el registro según el ID (nombre).
            const record = results.find(result => result.nombre === id);
            // Almacena la información del registro a modificar en 'localStorage'.
            localStorage.setItem('information', JSON.stringify(record));
            // Redirige a la página 'editor.html'.
            window.location.href = `editor.html`;
        });
    });

    // Obtiene todos los elementos de botón de la clase 'delete'.
    const deleteButtons = document.querySelectorAll('.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Obtiene el valor del atributo 'data-name'.
            const id = event.target.getAttribute('data-name');
            // Emite una solicitud fetch (DELETE) a la API, con el ID (nombre) como parámetro.
            fetch(`http://localhost:3000/${id}`, {
                method: 'DELETE',
            })
            .then(response => {
                // Verifica si la respuesta es exitosa.
                if (!response.ok) {
                    throw new Error('Error al eliminar el registro');
                }
                // Convierte la respuesta a formato JSON.
                return response.json();
            })
            .then(data => {
                console.log('Registro eliminado:', data);
            })
            .catch(error => {
                // Maneja errores de la solicitud fetch.
                console.error('Error:', error);
            });
            // Redirige a la página 'main.html'.
            window.location.href = 'main.html'
        });
    });

    // Obtiene el elemento de botón de retorno.
    const backButton = document.getElementById('back');
    backButton.addEventListener('click', () => {
        // Redirige a la página 'main.html'.
        window.location.href = 'main.html';
    });
}

// Verifica si la ruta actual termina con 'input.html'.
if (window.location.pathname.endsWith('input.html')) {
    // Obtiene el elemento de botón de envío.
    const addButton = document.getElementById('add');
    addButton.addEventListener('click', () => {
        // Redirige a la página 'main.html'.
        window.location.href = 'main.html';
    });
}

// Verifica si la ruta actual termina con 'editor.html'.
if (window.location.pathname.endsWith('editor.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Obtiene la información del registro a modificar desde 'localStorage'.
        const playerData = localStorage.getItem('information');
        // Verifica la existencia de la información.
        if (playerData) {
            const player = JSON.parse(playerData);
            // Muestra la información actual en el formulario.
            document.getElementById('name').value = player.nombre || '';
            document.getElementById('age').value = player.edad || '';
            document.getElementById('nationality').value = player.nacionalidad || '';
            document.getElementById('dorsal').value = player.dorsal || '';
            document.getElementById('position').value = player.posicion || '';
            document.getElementById('height').value = player.estatura || '';
            document.getElementById('marketvalue').value = player.valormercado || '';
            document.getElementById('image').value = player.imagen || '';
        } else {
            // En caso contrario, imprime por consola un mensaje de error.
            console.error('Registro no encontrado');
        }
    });
    // Obtiene el elemento del formulario de edición.
    const editFormElement = document.getElementById('edit-form');
    editFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
        // Obtiene los valores de los campos del formulario.
        const item = {
            nombre: document.getElementById('name').value,
            edad: parseInt(document.getElementById('age').value),
            nacionalidad: document.getElementById('nationality').value,
            dorsal: parseInt(document.getElementById('dorsal').value),
            posicion: document.getElementById('position').value,
            estatura: parseFloat(document.getElementById('height').value),
            valormercado: document.getElementById('marketvalue').value,
            imagen: document.getElementById('image').value
        };
        // Emite una solicitud fetch (PUT) a la API, con el objeto de registro modificado como cuerpo de la solicitud.
        fetch(`http://localhost:3000`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        })
        .then(response => {
            // Verifica si la respuesta es exitosa.
            if (!response.ok) {
                throw new Error('Error al modificar el registro');
            }
            // Convierte la respuesta a formato JSON.
            return response.json();
        })
        .then(data => {
            console.log('Registro editado:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        // Redirige a la página 'main.html'.
        window.location.href = 'main.html'
    });
}