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

    const createCategoryBlock = (name = "Nueva Categoría") => {
        const block = document.createElement("div");
        block.className = "category-block";
        block.textContent = name;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-category-btn";
        deleteBtn.textContent = "×";

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
                block.remove();
            }
        });

        block.addEventListener("dblclick", () => {
            const newName = prompt("Editar nombre de la categoría:", block.textContent);
            if (newName !== null && newName.trim() !== "") {
                block.textContent = newName.trim();
                block.appendChild(deleteBtn);
            }
        });
        block.appendChild(deleteBtn);
        categoriesContainer.appendChild(block);
    };

    addCategoryBtn.addEventListener("click", () => {
        createCategoryBlock();
    });

    createCategoryBlock("Entradas");
    createCategoryBlock("Platos Fuertes");
    createCategoryBlock("Postres");
    createCategoryBlock("Bebidas");
});
