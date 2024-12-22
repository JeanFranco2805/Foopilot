document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector(".orders-table tbody");
    const logoutButton = document.getElementById("logoutButton");
    const modal = document.querySelector("#detallesModal"); // Modal para detalles del pedido

    async function cargarPedidos() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/orders/all");
            if (!response.ok) {
                throw new Error("No se pudo obtener la lista de pedidos");
            }

            const pedidos = await response.json();

            tableBody.innerHTML = "";

            pedidos.forEach((pedido) => {
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
                            <button class="edit-btn" onclick="actualizarFila(this)">Actualizar</button>
                            <button class="delete-btn" onclick="eliminarPedido(this)">Eliminar</button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(fila);
            });
        } catch (error) {
            console.error("Error al cargar los pedidos:", error.message);
            Swal.fire("Error", "❌ No se pudieron cargar los pedidos. Verifique la conexión.", "error");
        }
    }

    // Función para manejar el botón "Ver Detalles"
    tableBody.addEventListener("click", function (event) {
        if (event.target.classList.contains("ver-detalles-btn")) {
            const idPedido = event.target.dataset.id;

            // Solicitud al backend
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

    // Función para mostrar detalles en el modal
    function mostrarDetallesPedido(detalles) {
        const modalBody = modal.querySelector(".modal-body");

        // Crear el contenido dinámico para los productos
        let productosHTML = detalles.productos.map(producto => `
            <p><strong>${producto.nombre}</strong> - 
            Cantidad: ${producto.cantidad}, 
            Precio unitario: $${producto.precio_unitario.toFixed(2)}, 
            Subtotal: $${producto.subtotal.toFixed(2)}</p>
        `).join("");

        // Llenar el contenido del modal
        modalBody.innerHTML = `
            <p><strong>ID Pedido:</strong> ${detalles.id_pedido}</p>
            <p><strong>Fecha:</strong> ${detalles.fecha_hora}</p>
            <p><strong>Estado:</strong> ${detalles.estado}</p>
            <p><strong>Total:</strong> $${detalles.total.toFixed(2)}</p>
            <h3>Productos:</h3>
            ${productosHTML}
        `;
        modal.style.display = "block"; // Mostrar el modal
    }

    // Cerrar modal
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
                const response = await fetch("http://127.0.0.1:5000/auth/logout", {
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

    cargarPedidos(); // Cargar pedidos al iniciar
});
