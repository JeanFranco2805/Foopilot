const BASE_URL = "http://127.0.0.1:5000/api/categories"
const BASE_URL_PRODUCTS = "http://127.0.0.1:5000/api/products/productos"
function editImage(imageElement) {
    const newUrl = prompt("Ingresa la nueva URL de la imagen:");
    if (newUrl) {
        imageElement.src = newUrl;
    }
}

function editProduct(buttonElement) {
    alert("El producto está en modo de edición. Realiza los cambios en los campos disponibles.");
}

function deleteProduct(buttonElement) {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        const productItem = buttonElement.closest('.menu-item');
        productItem.remove();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const categoriesContainer = document.getElementById("categories");
    const addCategoryBtn = document.getElementById("add-category-btn");

    // Función para crear un bloque de categoría en la UI
    const createCategoryBlock = (name = "Nueva Categoría", persistInDB = true) => {
        const block = document.createElement("div");
        block.className = "category-block";
        block.textContent = name;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-category-btn";
        deleteBtn.textContent = "×";

        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
                try {
                    const response = await fetch(BASE_URL + `/categories/${name}`, {method: "DELETE"});
                    if (response.ok) {
                        block.remove();
                        alert("Categoría eliminada exitosamente.");
                    } else {
                        const error = await response.json();
                        alert(`Error al eliminar la categoría: ${error.error}`);
                    }
                } catch (err) {
                    alert("Error al conectar con el servidor.");
                }
            }
        });

        block.addEventListener("dblclick", async () => {
            const newName = prompt("Editar nombre de la categoría:", block.textContent);
            if (newName !== null && newName.trim() !== "") {
                try {
                    const response = await fetch(BASE_URL + `/${name}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({nuevo_nombre: newName.trim()}),
                    });

                    if (response.ok) {
                        block.textContent = newName.trim();
                        block.appendChild(deleteBtn);
                        alert("Categoría actualizada exitosamente.");
                    } else {
                        const error = await response.json();
                        alert(`Error al actualizar la categoría: ${error.error}`);
                    }
                } catch (err) {
                    alert("Error al conectar con el servidor.");
                }
            }
        });

        block.appendChild(deleteBtn);
        categoriesContainer.appendChild(block);

        if (persistInDB) {
            insertCategoryToDB(name);
        }
    };

    const insertCategoryToDB = async (name) => {
        try {
            const response = await fetch(BASE_URL + `/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nombre_categoria: name}),
            });

            if (!response.ok) {
                const error = await response.json();
                alert(`Error al agregar la categoría: ${error.error}`);
                return false;
            }
            alert("Categoría agregada exitosamente.");
            return true;
        } catch (err) {
            alert("Error al conectar con el servidor.");
            return false;
        }
    };

    const loadCategoriesFromDB = async () => {
        try {
            const response = await fetch(BASE_URL + `/`, {method: "GET"});
            if (response.ok) {
                const categories = await response.json();
                categories.forEach((category) => {
                    createCategoryBlock(category.nombre_categoria, false); // No persistimos en la BD al cargar
                });
            } else {
                const error = await response.json();
                alert(`Error al cargar categorías: ${error.error}`);
            }
        } catch (err) {
            alert("Error al conectar con el servidor.");
        }
    };

    addCategoryBtn.addEventListener("click", () => {
        const categoryName = prompt("Nombre de la nueva categoría:");
        if (categoryName && categoryName.trim() !== "") {
            createCategoryBlock(categoryName.trim());
        }
    });
    async function loadProducts() {
        const menuContainer = document.getElementById("menu");

        try {
            const response = await fetch(BASE_URL_PRODUCTS);
            if (!response.ok) {
                throw new Error("Error al obtener los productos del servidor");
            }

            const products = await response.json();
            menuContainer.innerHTML = "";

            products.forEach(product => {
                const div = document.createElement("div");
                div.className = "menu-item";
                div.setAttribute("data-id", product.id);

                // Imagen
                const img = document.createElement("img");
                img.src = product.imagen || "https://via.placeholder.com/150";
                img.className = "menu-image";
                img.alt = product.nombre;

                // Nombre del producto (editable)
                const nameField = document.createElement("h2");
                nameField.textContent = product.nombre;
                nameField.onclick = () => toggleInput(nameField);

                // ID de la categoría (editable)
                const categoryField = document.createElement("p");
                categoryField.textContent = `Categoría: ${product.categoria_id}`;
                categoryField.onclick = () => toggleInput(categoryField);

                // Precio (editable)
                const priceField = document.createElement("span");
                priceField.className = "price";
                priceField.textContent = `$${product.precio}`;
                priceField.onclick = () => toggleInput(priceField);

                // ID del producto (no editable, solo display)
                const details = document.createElement("div");
                details.className = "details";
                details.innerHTML = `<p><strong>ID:</strong> ${product.id}</p>`;

                // Botones de acción
                const menuActions = document.createElement("div");
                menuActions.className = "menu-actions";

                const editBtn = document.createElement("button");
                editBtn.className = "edit-btn";
                editBtn.textContent = "Editar";
                editBtn.onclick = () => updateProduct(div, nameField, categoryField, priceField);

                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-btn";
                deleteBtn.textContent = "Eliminar";
                deleteBtn.onclick = () => {
                    const productId = div.getAttribute("data-id");
                    deleteProduct(deleteBtn, productId);
                };

                menuActions.appendChild(editBtn);
                menuActions.appendChild(deleteBtn);

                // Estructurar tarjeta
                div.appendChild(img);
                div.appendChild(nameField);
                div.appendChild(categoryField);
                div.appendChild(details);
                div.appendChild(priceField);
                div.appendChild(menuActions);

                menuContainer.appendChild(div);
            });
        } catch (error) {
            console.error("Error al cargar los productos:", error);
            alert("No se pudieron cargar los productos.");
        }
    }
    async function deleteProduct(buttonElement, productId) {
        if (confirm("¿Estás seguro de eliminar este producto?")) {
            try {
                const response = await fetch(`${BASE_URL_PRODUCTS}/${productId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    const productItem = buttonElement.closest('.menu-item');
                    productItem.remove();
                    alert("Producto eliminado exitosamente.");
                } else {
                    const error = await response.json();
                    alert(`Error al eliminar el producto: ${error.error}`);
                }
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
                alert("No se pudo conectar con el servidor. Inténtalo más tarde.");
            }
        }
    }
// Función para convertir un campo en input
    function toggleInput(element) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = element.textContent.replace(/[^0-9.]/g, "").trim(); // Eliminar $ y espacios
        input.onblur = () => {
            element.textContent = input.value;
            input.replaceWith(element);
        };
        element.replaceWith(input);
        input.focus();
    }

// Función para actualizar un producto en la base de datos
    async function updateProduct(div, nameField, categoryField, priceField) {
        const productId = div.getAttribute("data-id");
        const newName = nameField.textContent.trim();
        const newCategoryId = categoryField.textContent.replace("Categoría: ", "").trim();
        const newPrice = parseFloat(priceField.textContent.replace("$", "").trim());

        if (!newName || isNaN(newCategoryId) || isNaN(newPrice)) {
            alert("Los datos no son válidos.");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL_PRODUCTS}/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombre: newName,
                    categoria_id: parseInt(newCategoryId),
                    precio: newPrice,
                }),
            });

            if (response.ok) {
                alert("Producto actualizado exitosamente.");
            } else {
                const error = await response.json();
                alert(`Error al actualizar el producto: ${error.error}`);
            }
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            alert("Error al actualizar el producto.");
        }
    }
    loadProducts()
    loadCategoriesFromDB();
});
