const BASE_URL_PRODUCTS = "/api/products/productos/";
const BASE_URL_CATEGORIES = "/api/categories/";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("editProductForm");
    const productId = new URLSearchParams(window.location.search).get("id");
    const productNameInput = document.getElementById("productName");
    const productPriceInput = document.getElementById("productPrice");
    const productCategorySelect = document.getElementById("productCategory");
    const productDescriptionInput = document.getElementById("productDescription");
    const productImageInput = document.getElementById("productImage");
    async function loadCategories() {
        try {
            const response = await fetch(BASE_URL_CATEGORIES);
            if (!response.ok) throw new Error("Error al cargar las categorías");

            const categories = await response.json();
            productCategorySelect.innerHTML = categories.map(
                category => `<option value="${category.id_categoria}">${category.nombre_categoria}</option>`
            ).join("");
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudieron cargar las categorías.", "error");
        }
    }

    async function loadProduct() {
        try {
            const response = await fetch(`${BASE_URL_PRODUCTS}${productId}`);
            if (!response.ok) throw new Error("Error al cargar el producto");

            const product = await response.json();
            productNameInput.value = product.nombre;
            productPriceInput.value = product.precio;
            productCategorySelect.value = product.categoria_id;
            productDescriptionInput.value = product.descripcion;
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo cargar el producto.", "error");
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const updatedProduct = {
            nombre: productNameInput.value,
            precio: parseFloat(productPriceInput.value),
            categoria_id: parseInt(productCategorySelect.value),
            descripcion: productDescriptionInput.value
        };

        if (productImageInput.files.length > 0) {
            const file = productImageInput.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                updatedProduct.imagen = e.target.result;

                try {
                    const response = await fetch(`${BASE_URL_PRODUCTS}${productId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedProduct),
                    });

                    if (response.ok) {
                        Swal.fire("Éxito", "Producto actualizado exitosamente.", "success").then(() => {
                            window.location.href = `${window.location.origin}/home/employee/admin`;
                        });
                    } else {
                        const error = await response.json();
                        Swal.fire("Error", `Error al actualizar el producto: ${error.error}`, "error");
                    }
                } catch (error) {
                    console.error(error);
                    Swal.fire("Error", "No se pudo actualizar el producto.", "error");
                }
            };
            reader.readAsDataURL(file);
        } else {
            try {
                const response = await fetch(`${BASE_URL_PRODUCTS}${productId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedProduct),
                });

                if (response.ok) {
                    Swal.fire("Éxito", "Producto actualizado exitosamente.", "success").then(() => {
                        window.location.href = `${window.location.origin}/home/employee/admin`;
                    });
                } else {
                    const error = await response.json();
                    Swal.fire("Error", `Error al actualizar el producto: ${error.error}`, "error");
                }
            } catch (error) {
                console.error(error);
                Swal.fire("Error", "No se pudo actualizar el producto.", "error");
            }
        }
    });

    loadCategories();
    loadProduct();
});
