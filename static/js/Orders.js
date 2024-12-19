document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector(".orders-table tbody");

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
                        <button class="details-btn" onclick="verDetalles(${pedido.id_pedido})">Ver Detalles</button>
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
            alert("❌ No se pudieron cargar los pedidos. Verifique la conexión.");
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
            alert("❌ El campo Total debe ser un número válido.");
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
                alert("✅ Pedido actualizado exitosamente");
                cargarPedidos();
            } else {
                const error = await response.json();
                alert(`❌ Error: ${error.message}`);
            }
        } catch (error) {
            console.error("Error al actualizar el pedido:", error.message);
            alert("❌ No se pudo actualizar el pedido.");
        }
    };

    window.eliminarPedido = async function (boton) {
        const fila = boton.closest("tr");
        const idPedido = fila.dataset.idPedido;

        if (!confirm(`¿Estás seguro de que deseas eliminar el pedido con ID ${idPedido}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/orders/eliminar/${idPedido}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("✅ Pedido eliminado exitosamente");
                fila.remove();
            } else {
                const error = await response.json();
                alert(`❌ Error al eliminar el pedido: ${error.message}`);
            }
        } catch (error) {
            console.error("Error al eliminar el pedido:", error.message);
            alert("❌ No se pudo eliminar el pedido.");
        }
    };

    cargarPedidos();
});
