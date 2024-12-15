const BASE_URL = "http://127.0.0.1:5000/api/categories"

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
                    const response = await fetch(BASE_URL+`/${name}`, {
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
            const response = await fetch(BASE_URL+`/`, {
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
            const response = await fetch(BASE_URL+`/`, {method: "GET"});
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

    loadCategoriesFromDB();
});
