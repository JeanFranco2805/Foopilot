document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pedidoForm");
    const productosContainer = document.getElementById("productos-container");
    const idEmpleadoField = document.getElementById("id_empleado");
    const estadoField = document.getElementById("estado");
    const fechaEntregaField = document.getElementById("fecha_hora_desc");
    const totalDisplay = document.createElement("div"); // Elemento para mostrar el total
    let total = 0;
    let employee = null
    let pedido = null
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
            const response = await fetch(`/api/orders/obtener/${localStorage.getItem('pedidoId')}`);
            pedido = await response.json();
            const response2 = await fetch(`/api/employee/byId/${pedido.id_empleado}`)
            employee = await response2.json()
            idEmpleadoField.value = `#${employee.id} - ${employee.nombre} ${employee.apellido}`;
            idEmpleadoField.setAttribute("data-id", employee.id);
            idEmpleadoField.disabled = true;
            cargarMesasEmpleado(employee.id);
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
            const inputMesas = document.getElementById("id_mesa")
            mesas.forEach((mesa, index) => {
                const option = document.createElement("option");
                option.value = mesa.id;
                option.textContent = `MESA #${index + 1} - ID: ${mesa.id}`;
                dataList.appendChild(option);
            })
            inputMesas.value = pedido.id_mesa
            let response2 = await fetch(`/api/orders/find/${pedido.id_mesa}`);
            let json2 = await response2.json()
            cargarPedidoExistente(json2)
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
            const response = await fetch(`/api/orders/actualizar/${pedido.id_pedido}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    title: "Éxito",
                    text: `✅ Pedido actualizado con éxito. ID: ${pedido.id_pedido}`,
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
        const mesaId = event.target.value;
        if (!mesaId) return;
        try {
            const response = await fetch(`/api/orders/find/${mesaId}`);
            if (!response.ok) {
                throw new Error("No se pudo obtener el pedido para esta mesa.");
            }
            const pedido = await response.json();
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

    function cargarPedidoExistente(pedido) {
        Swal.fire("Pedido en curso", `Se cargó el pedido en curso para la mesa ${pedido.id_mesa}.`, "info");
        estadoField.value = pedido.estado;
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
