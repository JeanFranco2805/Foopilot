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

    window.hacerEditable = function (celda, campo) {
        const valorActual = celda.innerText.replace("$", "").trim();
        celda.innerHTML = `<input type="text" value="${valorActual}" data-campo="${campo}" class="editable-input">`;
        const input = celda.querySelector("input");
        input.focus();

        input.addEventListener("blur", () => {
            const nuevoValor = parseFloat(input.value.trim().replace(",", "."));
            if (!isNaN(nuevoValor)) {
                celda.innerText = `$${nuevoValor.toFixed(2)}`;
            } else {
                celda.innerText = "$0.00";
            }
        });
    };

    window.actualizarFila = async function (boton) {
        const fila = boton.closest("tr");
        const idPedido = fila.dataset.idPedido;

        const id_mesa = fila.children[1].innerText.trim();
        const mesero = fila.children[2].innerText.trim();
        const Total = fila.children[3].innerText.replace("$", "").replace(",", ".").trim();
        const fecha_hora = fila.children[4].innerText.trim();
        const estado = fila.children[5].innerText.trim();

        if (isNaN(parseFloat(Total))) {
            Swal.fire("Error", "❌ El campo Total debe ser un número válido.", "error");
            return;
        }

        const datosActualizados = {
            id_mesa,
            mesero,
            Total: parseFloat(Total),
            fecha_hora,
            estado
        };

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/orders/actualizar/${idPedido}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosActualizados)
            });

            if (response.ok) {
                Swal.fire("Éxito", "✅ Pedido actualizado exitosamente.", "success");
                cargarPedidos();
            } else {
                const error = await response.json();
                Swal.fire("Error", `❌ ${error.message}`, "error");
            }
        } catch (error) {
            console.error("Error al actualizar el pedido:", error.message);
            Swal.fire("Error", "❌ No se pudo actualizar el pedido.", "error");
        }
    };

    window.eliminarPedido = async function (boton) {
        const fila = boton.closest("tr");
        const idPedido = fila.dataset.idPedido;

        Swal.fire({
            title: "¿Eliminar pedido?",
            text: `¿Estás seguro de que deseas eliminar el pedido con ID ${idPedido}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/orders/eliminar/${idPedido}`, {
                        method: "DELETE",
                    });

                    if (response.ok) {
                        Swal.fire("Éxito", "✅ Pedido eliminado exitosamente.", "success");
                        fila.remove();
                    } else {
                        const error = await response.json();
                        Swal.fire("Error", `❌ ${error.message}`, "error");
                    }
                } catch (error) {
                    console.error("Error al eliminar el pedido:", error.message);
                    Swal.fire("Error", "❌ No se pudo eliminar el pedido.", "error");
                }
            }
        });
    };

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
        modal.querySelector(".modal-body").innerHTML = `
            <p><strong>ID Pedido:</strong> ${detalles.id_pedido}</p>
            <p><strong>Fecha:</strong> ${detalles.fecha_hora}</p>
            <p><strong>Estado:</strong> ${detalles.estado}</p>
            <p><strong>Total:</strong> $${detalles.total}</p>
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
