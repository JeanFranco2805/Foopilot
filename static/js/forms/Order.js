document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pedidoForm");
    const productosContainer = document.getElementById("productos-container");
    const idEmpleadoField = document.getElementById("id_empleado");
    const estadoField = document.getElementById("estado");
    const fechaEntregaField = document.getElementById("fecha_hora_desc");
    const totalDisplay = document.createElement("div"); // Elemento para mostrar el total
    let total = 0;

    function getCurrentDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    estadoField.value = "En proceso";
    fechaEntregaField.value = getCurrentDateTime();
    async function getCurrentEmployee() {
        try {
            const response = await fetch("/api/employee/current_user");
            if (!response.ok) throw new Error("No se pudo obtener el empleado actual");

            const empleado = await response.json();

            // Mostrar el formato #[Código] - Nombre Apellidos
            const displayText = `#${empleado.id} - ${empleado.nombre} ${empleado.apellido}`;
            idEmpleadoField.value = displayText; // Mostrar el texto en el campo
            idEmpleadoField.setAttribute("data-id", empleado.id); // Guardar solo el ID como atributo
            idEmpleadoField.disabled = true; // Asegurar que no sea editable
            cargarMesasEmpleado(empleado.id);
        } catch (error) {
            console.error("Error al obtener el empleado actual:", error);
            Swal.fire("Error", "❌ No se pudo obtener el empleado actual.", "error");
        }
    }



    async function cargarMesasEmpleado(empleadoId) {
        try {
            const response = await fetch(`/api/mesas/empleado/${empleadoId}`);
            if (!response.ok) throw new Error("Error al obtener mesas atendidas.");

            const mesas = await response.json();
            const dataList = document.getElementById("mesas");
            dataList.innerHTML = "";

            mesas.forEach((mesa, index) => {
                const option = document.createElement("option");
                option.value = mesa.id;
                option.textContent = `MESA #${index + 1} - ID: ${mesa.id}`;
                dataList.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar mesas del empleado:", error);
            Swal.fire("Error", "❌ No se pudieron cargar las mesas del empleado.", "error");
        }
    }
    function actualizarTotal() {
        total = 0;
        const productosSeleccionados = document.querySelectorAll(".producto-item input[type='checkbox']:checked");
        productosSeleccionados.forEach((checkbox) => {
            const cantidadInput = checkbox.parentElement.querySelector(".cantidad-input");
            const precio = parseFloat(checkbox.dataset.precio);
            const cantidad = parseInt(cantidadInput.value) || 0;
            total += precio * cantidad;
        });
        totalDisplay.textContent = `Total del Pedido: $${total.toFixed(2)}`;
    }

    async function cargarProductos() {
        try {
            const [productosResponse, categoriasResponse] = await Promise.all([
                fetch("/api/products/productos"),
                fetch("/api/categories/")
            ]);

            if (!productosResponse.ok || !categoriasResponse.ok)
                throw new Error("Error al cargar productos o categorías");

            const productos = await productosResponse.json();
            const categorias = await categoriasResponse.json();

            const categoriasMap = {};
            categorias.forEach(categoria => {
                categoriasMap[categoria.id_categoria] = categoria.nombre_categoria;
            });

            const productosPorCategoria = {};
            productos.forEach(prod => {
                const idCategoria = prod.categoria_id;
                const nombreCategoria = categoriasMap[idCategoria] || "Sin Categoría";
                if (!productosPorCategoria[nombreCategoria]) {
                    productosPorCategoria[nombreCategoria] = [];
                }
                productosPorCategoria[nombreCategoria].push(prod);
            });

            // Mantener productos ya seleccionados y sus cantidades
            const productosSeleccionados = {};
            document.querySelectorAll(".producto-item input[type='checkbox']:checked").forEach(checkbox => {
                const cantidadInput = checkbox.parentElement.querySelector(".cantidad-input");
                productosSeleccionados[checkbox.value] = {
                    cantidad: cantidadInput.value,
                    checked: true
                };
            });

            productosContainer.innerHTML = ""; // Limpiar contenedor
            for (const categoria in productosPorCategoria) {
                const categorySection = document.createElement("div");
                categorySection.classList.add("categoria-section");

                const title = document.createElement("h4");
                title.textContent = categoria;
                title.style.color = "#007bff";
                categorySection.appendChild(title);

                productosPorCategoria[categoria].forEach(producto => {
                    const isChecked = productosSeleccionados[producto.id]?.checked || false;
                    const cantidad = productosSeleccionados[producto.id]?.cantidad || 1;

                    const checkboxContainer = document.createElement("div");
                    checkboxContainer.classList.add("producto-item");
                    checkboxContainer.style.marginBottom = "10px";

                    checkboxContainer.innerHTML = `
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" name="productos" value="${producto.id}" data-precio="${producto.precio}" ${isChecked ? "checked" : ""} style="margin-right: 8px;">
                        ${producto.nombre} - $${producto.precio}
                        <input type="number" class="cantidad-input" min="1" value="${cantidad}" style="width: 60px; border: 1px solid #ccc; border-radius: 5px; padding: 5px;" ${isChecked ? "" : "disabled"}>
                    </label>
                `;

                    const checkbox = checkboxContainer.querySelector("input[type='checkbox']");
                    const cantidadInput = checkboxContainer.querySelector(".cantidad-input");

                    // Habilitar/deshabilitar cantidad según checkbox
                    checkbox.addEventListener("change", () => {
                        cantidadInput.disabled = !checkbox.checked;
                        actualizarTotal();
                    });

                    cantidadInput.addEventListener("input", actualizarTotal);

                    categorySection.appendChild(checkboxContainer);
                });

                productosContainer.appendChild(categorySection);
            }

            productosContainer.appendChild(totalDisplay);
            actualizarTotal();
        } catch (error) {
            console.error("Error al cargar productos:", error.message);
            Swal.fire("Error", "❌ No se pudieron cargar los productos.", "error");
        }
    }


    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const productosSeleccionados = [];
        document.querySelectorAll(".producto-item input[type='checkbox']:checked").forEach(checkbox => {
            const cantidadInput = checkbox.parentElement.querySelector(".cantidad-input");
            productosSeleccionados.push({
                id_producto: checkbox.value,
                cantidad: parseInt(cantidadInput.value) || 0
            });
        });

        const formData = {
            id_mesa: document.getElementById("id_mesa").value,
            id_empleado: idEmpleadoField.getAttribute('data-id'),
            estado: document.getElementById("estado").value,
            fecha_hora_desc: document.getElementById("fecha_hora_desc").value || null,
            Total: total,
            productos: productosSeleccionados
        };

        try {
            const response = await fetch("/api/orders/insertar", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    title: "Éxito",
                    text: `✅ Pedido insertado con éxito. ID: ${result.id_pedido}`,
                    icon: "success",
                    confirmButtonText: "Aceptar"
                });
                form.reset();
                totalDisplay.textContent = "Total del Pedido: $0.00";
            } else {
                const error = await response.json();
                Swal.fire("Error", `❌ ${error.error || "No se pudo insertar el pedido."}`, "error");
            }
        } catch (err) {
            console.error("Error al enviar la solicitud:", err.message);
            Swal.fire("Error", "❌ Error al insertar el pedido.", "error");
        }
    });
    document.getElementById("id_mesa").addEventListener("change", async (event) => {
        const mesaId = event.target.value; // Obtener el ID de la mesa seleccionada
        if (!mesaId) return;
        try {
            const response = await fetch(`/api/orders/find/${mesaId}`);
            if (!response.ok) {
                throw new Error("No se pudo obtener el pedido para esta mesa.");
            }

            const pedido = await response.json();
            console.log(pedido)
            if (pedido && pedido.estado === "En proceso") {
                cargarPedidoExistente(pedido);
            } else {
                Swal.fire("Mesa libre", "Esta mesa no tiene pedidos en curso.", "info");
            }
        } catch (error) {
            console.error("Error al buscar pedido:", error);
            Swal.fire("Error", "❌ No se pudo buscar el pedido para esta mesa.", "error");
        }
    });

// Función para cargar un pedido existente
    function cargarPedidoExistente(pedido) {
        Swal.fire("Pedido en curso", `Se cargó el pedido en curso para la mesa ${pedido.id_mesa}.`, "info");

        // Actualizar el estado del pedido
        estadoField.value = pedido.estado;

        // Limpiar los productos existentes en el contenedor
        productosContainer.innerHTML = "";

        pedido.productos.forEach((producto) => {
            const productHTML = `
            <div class="producto-item" style="margin-bottom: 10px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" name="productos" value="${producto.id_producto}" data-precio="${producto.precio}" checked>
                    ${producto.nombre} - $${producto.precio}
                    <input type="number" class="cantidad-input" min="1" value="${producto.cantidad}" style="width: 60px; border: 1px solid #ccc; border-radius: 5px; padding: 5px;">
                </label>
            </div>
        `;

            productosContainer.insertAdjacentHTML("beforeend", productHTML);
        });
        cargarProductos()
    }

    cargarProductos();
    getCurrentEmployee();
});
