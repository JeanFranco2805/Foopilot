window.onload = () => {
    const menuItems = document.querySelector('.menu-items');
    const addCardBtn = document.getElementById('add-card-btn');
    const logoutButton = document.getElementById("logoutButton");

    let currentEmployee = null;

    async function getCurrentEmployee() {
        try {
            const response = await fetch('/api/employee/current_user', { method: 'GET' });
            if (response.ok) {
                currentEmployee = await response.json();
            } else {
                console.error("Error al obtener el empleado actual.");
            }
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
        }
    }

    function loadTables() {
        fetch('/api/mesas/list', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                fetch('/api/employee/current_user', { method: 'GET' })
                    .then(response => response.json())
                    .then(userData => {
                        const userRole = userData.cargo;
                        menuItems.innerHTML = '';
                        data.forEach((table) => {
                            const isAdminOrManager = userRole === 'Administrador' || userRole === 'Gerente';
                            const newCard = `
                        <div class="menu-item" data-id="${table.id}">
                            <img class="menu-image" src="https://http2.mlstatic.com/D_NQ_NP_881059-MLM42193027710_062020-O.webp" alt="Mesa">
                            <h3>${table.nombre}</h3>
                            <p class="state"><strong>Estado:</strong> ${table.estado || "Desocupada"}</p>
                            <p class="waiter"><strong>Mesero:</strong> ${table.mesero || "Ninguno"}</p>
                            <div class="menu-actions">
                                <button class="edit-btn">Atender</button>
                                <button 
                                    class="delete-btn ${!isAdminOrManager ? 'blocked' : ''}" 
                                    ${!isAdminOrManager ? 'disabled' : ''} 
                                    onclick="${!isAdminOrManager ? 'alert(`No tienes permisos`)' : ''}">
                                    Eliminar
                                </button>
                            </div>
                        </div>`;
                            menuItems.insertAdjacentHTML('beforeend', newCard);
                        });
                    })
                    .catch(error => console.error("Error al obtener el usuario actual:", error));
            })
            .catch(error => console.error("Error al cargar mesas:", error));
    }





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
                loadTables();
            })
            .catch(error => console.error("Error al insertar la mesa:", error));
    });

    menuItems.addEventListener('click', (event) => {
        const card = event.target.closest('.menu-item');

        if (event.target.classList.contains('edit-btn')) {
            if (!currentEmployee) {
                Swal.fire("Error", "No se pudo identificar al empleado actual.", "error");
                return;
            }

            const mesaId = card.getAttribute('data-id');
            fetch(`/api/mesas/assign_employee`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_mesa: mesaId, id_empleado: currentEmployee.id })
            })
                .then(response => {
                    const isOk = response.ok;
                    return response.json().then(data => ({ isOk, data }));
                })
                .then(({ isOk, data }) => {
                    if (isOk) {
                        const stateEl = card.querySelector('.state');
                        const waiterEl = card.querySelector('.waiter');
                        stateEl.innerHTML = '<p class="state"><strong>Estado:</strong> Atendida</p>';
                        waiterEl.innerHTML = `<p class="waiter"><strong>Mesero:</strong> ${currentEmployee.nombre} ${currentEmployee.apellido}</p>`;
                    } else {
                        Swal.fire("Error", data.error || "No se pudo atender la mesa.", "error");
                    }
                })
                .catch(error => {
                    Swal.fire("Error", "Error al conectar con el servidor.", "error");
                    console.error("Error al asignar empleado a la mesa:", error);
                });
        }


        if (event.target.classList.contains('delete-btn')) {
            const mesaId = card.getAttribute('data-id');

            Swal.fire({
                title: "¿Marcar mesa como INACTIVA?",
                text: "¿Estás seguro de que deseas inactivar esta mesa?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, inactivar",
                cancelButtonText: "Cancelar",
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/api/mesas/delete/${mesaId}`, { method: 'DELETE' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message) {
                                Swal.fire("Éxito", "Mesa marcada como INACTIVA exitosamente.", "success");
                                loadTables();
                            } else {
                                Swal.fire("Error", "No se pudo inactivar la mesa.", "error");
                                console.error("Error:", data.error);
                            }
                        })
                        .catch(error => {
                            Swal.fire("Error", "Error al conectar con el servidor.", "error");
                            console.error("Error al inactivar la mesa:", error);
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
                const response = await fetch("/auth/logout", { method: "POST", credentials: "include" });

                if (response.ok) {
                    Swal.fire("Sesión cerrada", "Has cerrado sesión exitosamente.", "success").then(() => {
                        window.location.href = location.href;
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
    const profilePicture = document.getElementById("profile-picture");
    const profileInfo = document.querySelector(".profile-info");
    async function loadUserProfile() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/employee/current_user");
            if (!response.ok) throw new Error("No se pudo obtener los datos del usuario actual");

            const user = await response.json();
            if (user.foto_perfil) {
                profilePicture.src = user.foto_perfil;
            }

            profileInfo.innerHTML = `
                <p><strong>${user.nombre}</strong></p>
                <p>${user.cargo}</p>
            `;
        } catch (error) {
            console.error("Error al cargar el perfil del usuario:", error);
            Swal.fire("Error", "No se pudo cargar el perfil del usuario.", "error");
        }
    }

    profilePicture.addEventListener("dblclick", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";

        fileInput.addEventListener("change", async () => {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();

                reader.onload = async (e) => {
                    const base64Image = e.target.result;

                    try {
                        const response = await fetch("http://127.0.0.1:5000/api/employee/update_photo", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ foto_perfil: base64Image }),
                        });

                        if (response.ok) {
                            Swal.fire("Éxito", "Foto de perfil actualizada correctamente.", "success");
                            profilePicture.src = base64Image;
                        } else {
                            const error = await response.json();
                            Swal.fire("Error", `Error al actualizar la foto: ${error.error}`, "error");
                        }
                    } catch (err) {
                        console.error("Error al actualizar la foto:", err);
                        Swal.fire("Error", "No se pudo actualizar la foto de perfil.", "error");
                    }
                };

                reader.readAsDataURL(file);
            }
        });

        fileInput.click();
    });
    loadUserProfile();
    getCurrentEmployee().then(loadTables);
};
