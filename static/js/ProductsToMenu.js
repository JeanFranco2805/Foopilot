let btn = null;
let menu = JSON.parse(localStorage.getItem("menu")) || [];
let file = null;
let url = null;
const BASE_URL_CATEGORIES = "http://127.0.0.1:5000/api/categories";
const BASE_URL_PRODUCTS = "http://127.0.0.1:5000/api/products";

async function loadCategories() {
    const categorySelect = document.getElementById("product-category");

    try {
        const response = await fetch(BASE_URL_CATEGORIES + "/");
        if (response.ok) {
            const categories = await response.json();

            categories.forEach((category) => {
                const option = document.createElement("option");
                option.value = category.id_categoria; // Usa el ID como valor
                option.textContent = category.nombre_categoria; // Muestra el nombre de la categoría
                categorySelect.appendChild(option);
            });
        } else {
            console.error("Error al cargar las categorías:", response.statusText);
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
    }
}

function load() {
    btn = document.getElementById("btnSubmit");
    let productImg = document.getElementById("product-image");

    btn.addEventListener("click", handleSubmit);

    productImg.addEventListener("change", (files) => {
        file = files.target.files[0];

        const reader = new FileReader();
        reader.onload = function (e) {
            url = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    loadCategories();
}

async function handleSubmit(event) {
    event.preventDefault();
    let productName = document.getElementById("product-name");
    let productDesc = document.getElementById("product-description");
    let price = document.getElementById("product-price");
    let category = document.getElementById("product-category");

    if (productName && productDesc && price && category) {
        const selectedCategoryName = category.options[category.selectedIndex].text;

        try {
            // Buscar la categoría por su nombre
            const categoryResponse = await fetch(BASE_URL_CATEGORIES + "/");
            if (!categoryResponse.ok) {
                throw new Error("Error al obtener las categorías");
            }

            const categories = await categoryResponse.json();
            const selectedCategory = categories.find(
                (cat) => cat.nombre_categoria === selectedCategoryName
            );

            if (!selectedCategory) {
                throw new Error("Categoría no encontrada");
            }

            // Construir el cuerpo del producto con el ID de la categoría obtenida
            const productData = {
                nombre: productName.value,
                precio: parseFloat(price.value),
                categoria_id: selectedCategory.id_categoria, // Usar el ID de la categoría
            };

            // Enviar el producto al backend
            const productResponse = await fetch(BASE_URL_PRODUCTS + "/productos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
            });

            if (productResponse.ok) {
                alert("Producto agregado exitosamente");
                // Opcional: limpiar el formulario
                productName.value = "";
                productDesc.value = "";
                price.value = "";
                category.selectedIndex = 0;
            } else {
                const errorData = await productResponse.json();
                console.error("Error al agregar el producto:", errorData.error);
                alert("Error al agregar el producto: " + errorData.error);
            }
        } catch (error) {
            console.error("Error al procesar el formulario:", error);
            alert("Error al procesar el formulario. Revisa la consola para más detalles.");
        }
    } else {
        console.error("Algunos elementos del formulario no se encontraron.");
        alert("Por favor, completa todos los campos del formulario.");
    }
}

window.addEventListener("load", () => {
    load();
});
