window.onload = () => {
    const menuItems = document.querySelector('.menu-items');
    const addCardBtn = document.getElementById('add-card-btn');
    const logoutButton = document.getElementById("logoutButton");

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

            Swal.fire({
                title: "¿Eliminar mesa?",
                text: "¿Estás seguro de que deseas eliminar esta mesa?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/api/mesas/delete/${mesaId}`, { method: 'DELETE' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message) {
                                Swal.fire("Éxito", "Mesa eliminada exitosamente.", "success");
                                loadTables(); // Recargar mesas después de eliminar
                            } else {
                                Swal.fire("Error", "No se pudo eliminar la mesa.", "error");
                                console.error("Error:", data.error);
                            }
                        })
                        .catch(error => {
                            Swal.fire("Error", "Error al conectar con el servidor.", "error");
                            console.error("Error al eliminar la mesa:", error);
                        });
                }
            });
        }
    });
    logoutButton.addEventListener("click", async () => {
        const result = await Swal.fire({
            title: "¿Cerrar sesión?",
            text: "¿Estás seguro de que deseas cerrar sesión?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch("http://127.0.0.1:5000/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });

                if (response.ok) {
                    Swal.fire("Sesión cerrada", "Has cerrado sesión exitosamente.", "success").then(() => {
                        window.location.href=  location.href
                    });
                } else {
                    const error = await response.json();
                    Swal.fire("Error", `No se pudo cerrar la sesión: ${error.message}`, "error");
                }
            } catch (error) {
                Swal.fire("Error", "Error al intentar cerrar sesión. Inténtalo más tarde.", "error");
                console.error("Error al cerrar sesión:", error);
            }
        }
    });
    // Cargar mesas al iniciar la página
    loadTables();
};
