document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pedidoForm");
    const dataList = document.getElementById("empleados");
    const productosContainer = document.getElementById("productos-container");
    const totalDisplay = document.createElement("div"); // Elemento para mostrar el total

    let total = 0;

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
                fetch("http://127.0.0.1:5000/api/products/productos"),
                fetch("http://127.0.0.1:5000/api/categories/")
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

            productosContainer.innerHTML = "";
            for (const categoria in productosPorCategoria) {
                const categorySection = document.createElement("div");
                categorySection.classList.add("categoria-section");

                const title = document.createElement("h4");
                title.textContent = categoria;
                title.style.color = "#007bff";
                categorySection.appendChild(title);

                productosPorCategoria[categoria].forEach(producto => {
                    const checkboxContainer = document.createElement("div");
                    checkboxContainer.classList.add("producto-item");
                    checkboxContainer.style.marginBottom = "10px";

                    checkboxContainer.innerHTML = `
                        <label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" name="productos" value="${producto.id}" data-precio="${producto.precio}" style="margin-right: 8px;">
                            ${producto.nombre} - $${producto.precio}
                            <input type="number" class="cantidad-input" min="1" value="1" style="width: 60px; border: 1px solid #ccc; border-radius: 5px; padding: 5px;">
                        </label>
                    `;

                    const checkbox = checkboxContainer.querySelector("input[type='checkbox']");
                    const cantidadInput = checkboxContainer.querySelector(".cantidad-input");

                    checkbox.addEventListener("change", actualizarTotal);
                    cantidadInput.addEventListener("input", actualizarTotal);

                    categorySection.appendChild(checkboxContainer);
                });

                productosContainer.appendChild(categorySection);
            }

            productosContainer.appendChild(totalDisplay);
            actualizarTotal();
        } catch (error) {
            console.error("Error al cargar productos:", error.message);
            alert("❌ No se pudieron cargar los productos.");
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
            id_empleado: document.getElementById("id_empleado").value,
            estado: document.getElementById("estado").value,
            fecha_hora_desc: document.getElementById("fecha_hora_desc").value || null,
            Total: total,
            productos: productosSeleccionados
        };

        try {
            const response = await fetch("http://127.0.0.1:5000/api/orders/insertar", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`✅ Pedido insertado con éxito. ID: ${result.id_pedido}`);
                form.reset();
                totalDisplay.textContent = "Total del Pedido: $0.00";
            } else {
                const error = await response.json();
                alert(`❌ Error: ${error.error || "No se pudo insertar el pedido."}`);
            }
        } catch (err) {
            console.error("Error al enviar la solicitud:", err.message);
            alert("❌ Error al insertar el pedido.");
        }
    });
    async function cargarEmpleados() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/employee/all");
            if (!response.ok) throw new Error("Error al cargar empleados");

            const empleados = await response.json();

            dataList.innerHTML = "";
            empleados.forEach(empleado => {
                const option = document.createElement("option");
                option.value = empleado.id;
                option.textContent = `${empleado.nombre} ${empleado.apellido} - ${empleado.id}`;
                dataList.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar empleados:", error.message);
            alert("❌ No se pudieron cargar los empleados. Verifique la conexión al servidor.");
        }
    }
    cargarEmpleados()
    cargarProductos();
});
