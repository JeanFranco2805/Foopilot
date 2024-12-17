window.onload = () => {
    const menuItems = document.querySelector('.menu-items');
    const addCardBtn = document.getElementById('add-card-btn');

    // Función para cargar mesas desde el backend
    function loadTables() {
        fetch('/api/mesas/list', { method: 'GET' }) // Solicitud GET al backend
            .then(response => response.json())
            .then(data => {
                menuItems.innerHTML = ''; // Limpiar contenedor
                data.forEach((table, index) => {
                    const newCard = `
                    <div class="menu-item" data-id="${table.id}">
                        <img class="menu-image" src="https://http2.mlstatic.com/D_NQ_NP_881059-MLM42193027710_062020-O.webp" alt="Mesa">
                        <h3>Mesa #${index + 1}</h3>
                        <p class="state"><strong>Estado:</strong> Desocupada</p>
                        <p class="waiter"><strong>Mesero:</strong> Ninguno</p>
                        <div class="menu-actions">
                            <button class="edit-btn">Atender</button>
                            <button class="delete-btn">Eliminar</button>
                        </div>
                    </div>`;
                    menuItems.insertAdjacentHTML('beforeend', newCard);
                });
            })
            .catch(error => console.error("Error al cargar mesas:", error));
    }

    // Evento para agregar una nueva mesa
    addCardBtn.addEventListener('click', () => {
        const nuevaMesa = { nombre: `Mesa ${Date.now()}` };

        fetch('/api/mesas/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaMesa)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            loadTables(); // Recargar las mesas después de insertar
        })
        .catch(error => console.error("Error al insertar la mesa:", error));
    });

    // Manejo de eventos en el contenedor de mesas
    menuItems.addEventListener('click', (event) => {
        const card = event.target.closest('.menu-item');

        // Manejar el botón "Atender"
        if (event.target.classList.contains('edit-btn')) {
            const stateEl = card.querySelector('.state');
            const waiterEl = card.querySelector('.waiter');
            if (stateEl.textContent.includes('Desocupada')) {
                stateEl.innerHTML = '<p class="state"><strong>Estado:</strong> Atendida</p>';
                waiterEl.innerHTML = '<p class="waiter"><strong>Mesero:</strong> Juan Perez</p>';
            } else {
                stateEl.innerHTML = '<p class="state"><strong>Estado:</strong> Desocupada</p>';
                waiterEl.innerHTML = '<p class="waiter"><strong>Mesero:</strong> Ninguno</p>';
            }
        }

        // Manejar el botón "Eliminar"
        if (event.target.classList.contains('delete-btn')) {
            const mesaId = card.getAttribute('data-id'); // Obtener ID de la mesa
            fetch(`/api/mesas/delete/${mesaId}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        console.log(data.message);
                        loadTables(); // Recargar mesas después de eliminar
                    } else {
                        console.error("Error:", data.error);
                    }
                })
                .catch(error => console.error("Error al eliminar la mesa:", error));
        }
    });

    // Cargar mesas al iniciar la página
    loadTables();
};
