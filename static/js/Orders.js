document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector(".orders-table tbody");
    const logoutButton = document.getElementById("logoutButton");
    const modal = document.querySelector("#detallesModal");
    const filterMesero = document.getElementById("filterMesero");
    const filterEstado = document.getElementById("filterEstado");
    const filterFechaInicio = document.getElementById("filterFechaInicio");
    const filterFechaFin = document.getElementById("filterFechaFin");
    const filterButton = document.getElementById("filterButton");
    const clearFilterButton = document.getElementById("clearFilterButton");

    let pedidos = [];
    let currentPage = 1;
    const recordsPerPage = 5;
    const filtrosActivos = {
        mesero: "",
        estado: "",
        fechaInicio: null,
        fechaFin: null
    };

    async function cargarPedidos() {
        try {
            const response = await fetch("/api/orders/all");
            if (!response.ok) {
                throw new Error("No se pudo obtener la lista de pedidos");
            }

            pedidos = await response.json();
            filtrarYRenderizar();
        } catch (error) {
            console.error("Error al cargar los pedidos:", error.message);
            Swal.fire("Error", "❌ No se pudieron cargar los pedidos. Verifique la conexión.", "error");
        }
    }

    function filtrarYRenderizar() {
        let pedidosFiltrados = [...pedidos];

        if (filtrosActivos.mesero) {
            pedidosFiltrados = pedidosFiltrados.filter(pedido =>
                pedido.mesero.toLowerCase().includes(filtrosActivos.mesero)
            );
        }

        if (filtrosActivos.estado) {
            pedidosFiltrados = pedidosFiltrados.filter(pedido =>
                pedido.estado.toLowerCase() === filtrosActivos.estado.toLowerCase()
            );
        }

        if (filtrosActivos.fechaInicio) {
            pedidosFiltrados = pedidosFiltrados.filter(pedido =>
                new Date(pedido.fecha_hora) >= filtrosActivos.fechaInicio
            );
        }

        if (filtrosActivos.fechaFin) {
            pedidosFiltrados = pedidosFiltrados.filter(pedido =>
                new Date(pedido.fecha_hora) <= filtrosActivos.fechaFin
            );
        }

        renderPedidos(pedidosFiltrados, currentPage);
        generatePagination(pedidosFiltrados.length);
    }
    filterButton.addEventListener("click", () => {
        currentPage = 1; // Reiniciar a la primera página
        aplicarFiltros();
    });

    clearFilterButton.addEventListener("click", () => {
        filterMesero.value = "";
        filterEstado.value = "";
        filterFechaInicio.value = "";
        filterFechaFin.value = "";
        filtrosActivos = { mesero: "", estado: "", fechaInicio: null, fechaFin: null }; // Limpiar filtros
        currentPage = 1;
        renderPedidos(pedidos, currentPage);
        generatePagination(pedidos.length);
    });



    function renderPedidos(pedidos, page) {
        fetch('/api/employee/current_user', { method: 'GET' })
            .then(response => response.json())
            .then(userData => {
                const userRole = userData.cargo;
                const isAdminOrManager = userRole === 'Administrador' || userRole === 'Gerente';

                const startIndex = (page - 1) * recordsPerPage;
                const endIndex = startIndex + recordsPerPage;
                const pedidosPagina = pedidos.slice(startIndex, endIndex);

                tableBody.innerHTML = "";

                pedidosPagina.forEach((pedido) => {
                    const Total = typeof pedido.Total === "number" ? `$${pedido.Total.toFixed(2)}` : `$${pedido.Total}`;

                    const fila = document.createElement("tr");
                    fila.dataset.idPedido = pedido.id_pedido;

                    fila.innerHTML = `
                <td>${pedido.id_pedido}</td>
                <td ondblclick="hacerEditable(this, 'id_mesa')">${pedido.id_mesa}</td>
                <td ondblclick="hacerEditable(this, 'mesero')">${pedido.mesero}</td>
                <td ondblclick="hacerEditable(this, 'Total')">${Total}</td>
                <td ondblclick="hacerEditable(this, 'fecha_hora')">${pedido.fecha_hora}</td>
                <td ondblclick="hacerEditable(this, 'estado')">${pedido.estado}</td>
                <td>
                    <button class="details-btn ver-detalles-btn" data-id="${pedido.id_pedido}">Ver Detalles</button>
                </td>
                <td>
                    <div class="actions-container">
                        <button class="edit-btn ${!isAdminOrManager ? 'blocked' : ''}" 
                                ${!isAdminOrManager ? 'disabled' : ''} 
                                onclick="${!isAdminOrManager ? "showPermissionDeniedMessage()" : "actualizarFila(this)"}">
                            Actualizar
                        </button>
                        <button class="delete-btn ${!isAdminOrManager ? 'blocked' : ''}" 
                                ${!isAdminOrManager ? 'disabled' : ''} 
                                onclick="${!isAdminOrManager ? "showPermissionDeniedMessage()" : "eliminarPedido(this)"}">
                            Eliminar
                        </button>
                    </div>
                </td>
                `;
                    tableBody.appendChild(fila);
                });
            })
            .catch(error => console.error("Error al obtener el usuario actual:", error));
    }

    function showPermissionDeniedMessage() {
        Swal.fire({
            icon: 'error',
            title: 'Permiso denegado',
            text: 'No tienes permisos para realizar esta acción.',
            confirmButtonText: 'Entendido'
        });
    }


    function generatePagination(totalRecords) {
        const totalPages = Math.ceil(totalRecords / recordsPerPage);
        const paginationContainer = document.querySelector(".pagination-container");
        paginationContainer.innerHTML = "";

        const prevButton = document.createElement("button");
        prevButton.textContent = "Anterior";
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                filtrarYRenderizar();
            }
        });
        paginationContainer.appendChild(prevButton);

        const pageButtonsRange = 5;
        const startPage = Math.max(1, currentPage - Math.floor(pageButtonsRange / 2));
        const endPage = Math.min(totalPages, startPage + pageButtonsRange - 1);

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add("active");
            }
            pageButton.addEventListener("click", () => {
                currentPage = i;
                filtrarYRenderizar();
            });
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.textContent = "Siguiente";
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                filtrarYRenderizar();
            }
        });
        paginationContainer.appendChild(nextButton);
    }


    tableBody.addEventListener("click", function (event) {
        if (event.target.classList.contains("ver-detalles-btn")) {
            const idPedido = event.target.dataset.id;
            fetch(`/api/orders/details/${idPedido}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        Swal.fire("Error", data.error, "error");
                    } else {
                        mostrarDetallesPedido(data);
                    }
                })
                .catch(error => console.error("Error al obtener detalles del pedido:", error));
        }
    });
    window.hacerEditable = function (cell, field) {
        const originalValue = cell.innerText.trim();
        const input = document.createElement("input");
        input.type = "text";
        input.value = originalValue;

        cell.innerHTML = "";
        cell.appendChild(input);

        input.focus();
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                guardarValorEditado(cell, input, originalValue);
            }
        });
        input.addEventListener("blur", () => {
            guardarValorEditado(cell, input, originalValue);
        });
    };

    function guardarValorEditado(cell, input, originalValue) {
        const newValue = input.value.trim();
        if (newValue === originalValue || newValue === "") {
            cell.innerText = originalValue;
        } else {
            cell.innerText = newValue;
            cell.dataset.valueChanged = "true";
        }
    }
    window.actualizarFila = async function (button) {
        const fila = button.closest("tr");
        const idPedido = fila.dataset.idPedido;
        const data = {};
        fila.querySelectorAll("td[ondblclick]").forEach((cell) => {
            const field = cell.getAttribute("ondblclick").match(/'([^']+)'/)[1]; // Obtener el nombre del campo
            const valueChanged = cell.dataset.valueChanged === "true"; // Verificar si cambió el valor
            let value = cell.innerText.trim();

            if (valueChanged) {
                if (field === "Total") {
                    value = parseFloat(value.replace(/[^0-9.]/g, "")); // Remueve caracteres no numéricos
                    if (isNaN(value)) value = 0;
                }
                data[field] = value;
            }
        });

        if (Object.keys(data).length === 0) {
            Swal.fire("Sin cambios", "No se detectaron cambios para actualizar.", "info");
            return;
        }

        try {
            const response = await fetch(`/api/orders/actualizar/${idPedido}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire("Actualizado", result.message, "success");
                cargarPedidos();
            } else {
                const error = await response.json();
                const errorMessage = error.message || error.error || "Error desconocido"; // Manejar diferentes campos
                Swal.fire("Error", `No se pudo actualizar el pedido: ${errorMessage}`, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Ocurrió un error al actualizar el pedido.", "error");
            console.error("Error al actualizar pedido:", error);
        }
    };


    window.eliminarPedido = async function (button) {
        const fila = button.closest("tr");
        const idPedido = fila.dataset.idPedido;

        const result = await Swal.fire({
            title: "¿Eliminar pedido?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/orders/eliminar/${idPedido}`, {
                    method: "DELETE",
                });
                const result = await response.json();

                if (response.ok) {
                    Swal.fire("Eliminado", result.message, "success");
                    cargarPedidos();
                } else {
                    Swal.fire("Error", result.error || "No se pudo eliminar el pedido.", "error");
                }
            } catch (error) {
                Swal.fire("Error", "Ocurrió un error al intentar eliminar el pedido.", "error");
                console.error("Error al eliminar pedido:", error);
            }
        }
    };

    function mostrarDetallesPedido(detalles) {
        const modalBody = modal.querySelector(".modal-body");

        let productosHTML = detalles.productos.map(producto => `
            <p><strong>${producto.nombre}</strong> - 
            Cantidad: ${producto.cantidad}, 
            Precio unitario: $${producto.precio_unitario.toFixed(2)}, 
            Subtotal: $${producto.subtotal.toFixed(2)}</p>
        `).join("");

        modalBody.innerHTML = `
            <p><strong>ID Pedido:</strong> ${detalles.id_pedido}</p>
            <p><strong>Fecha:</strong> ${detalles.fecha_hora}</p>
            <p><strong>Estado:</strong> ${detalles.estado}</p>
            <p><strong>Total:</strong> $${detalles.total.toFixed(2)}</p>
            <h3>Productos:</h3>
            ${productosHTML}
        `;
        modal.style.display = "block";
    }

    modal.querySelector(".close").addEventListener("click", () => {
        modal.style.display = "none";
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
                const response = await fetch("/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });

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
            const response = await fetch("/api/employee/current_user");
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
                        const response = await fetch("/api/employee/update_photo", {
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
    function aplicarFiltros() {
        filtrosActivos.mesero = filterMesero.value.toLowerCase();
        filtrosActivos.estado = filterEstado.value;
        filtrosActivos.fechaInicio = filterFechaInicio.value ? new Date(filterFechaInicio.value) : null;
        filtrosActivos.fechaFin = filterFechaFin.value ? new Date(filterFechaFin.value) : null;

        let pedidosFiltrados = [...pedidos];

        if (filtrosActivos.mesero) {
            pedidosFiltrados = pedidosFiltrados.filter(pedido =>
                pedido.mesero.toLowerCase().includes(filtrosActivos.mesero)
            );
        }

        if (filtrosActivos.estado) {
            pedidosFiltrados = pedidosFiltrados.filter(pedido =>
                pedido.estado.toLowerCase() === filtrosActivos.estado.toLowerCase()
            );
        }

        if (filtrosActivos.fechaInicio) {
            pedidosFiltrados = pedidosFiltrados.filter(pedido =>
                new Date(pedido.fecha_hora) >= filtrosActivos.fechaInicio
            );
        }

        if (filtrosActivos.fechaFin) {
            pedidosFiltrados = pedidosFiltrados.filter(pedido =>
                new Date(pedido.fecha_hora) <= filtrosActivos.fechaFin
            );
        }

        renderPedidos(pedidosFiltrados, 1);
        generatePagination(pedidosFiltrados.length);
    }


    filterMesero.addEventListener("input", aplicarFiltros);
    filterEstado.addEventListener("change", aplicarFiltros);
    filterFechaInicio.addEventListener("change", aplicarFiltros);
    filterFechaFin.addEventListener("change", aplicarFiltros);

    filterButton.addEventListener("click", aplicarFiltros);

    clearFilterButton.addEventListener("click", () => {
        filterMesero.value = "";
        filterEstado.value = "";
        filterFechaInicio.value = "";
        filterFechaFin.value = "";
        renderPedidos(pedidos, 1);
    });

    loadUserProfile();
    cargarPedidos();
});
