const BASE_URL_PRODUCTS = "/api/products";
const BASE_URL_CATEGORIES = "/api/categories";
async function loadCategories() {
    try {
        const response = await fetch(BASE_URL_CATEGORIES);
        if (response.ok) {
            const categories = await response.json();
            const navContainer = document.querySelector('.menu-navigation ul');
            const menuContainer = document.querySelector('.menu-container');

            categories.forEach(category => {
                const navItem = document.createElement('li');
                const navLink = document.createElement('a');
                navLink.href = `#category-${category.id_categoria}`;
                navLink.textContent = category.nombre_categoria;
                navItem.appendChild(navLink);
                navContainer.appendChild(navItem);
                const section = document.createElement('section');
                section.id = `category-${category.id_categoria}`;
                section.className = 'menu-section';
                section.innerHTML = `
                    <h2>${category.nombre_categoria}</h2>
                    <div class="menu-items" id="category-items-${category.id_categoria}"></div>
                `;
                menuContainer.appendChild(section);
            });
        } else {
            console.error("Error al cargar las categorías:", response.statusText);
        }
    } catch (error) {
        console.error("Error al conectar con el servidor para categorías:", error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${BASE_URL_PRODUCTS}/productos`);
        if (response.ok) {
            const products = await response.json();

            for (const product of products) {
                const categoryContainer = document.getElementById(`category-items-${product.categoria_id}`);
                if (categoryContainer) {
                    const productCard = document.createElement("div");
                    productCard.className = "menu-item";
                    productCard.innerHTML = `
                        <img src="${product.imagen || 'https://via.placeholder.com/150'}" 
                             alt="${product.nombre}" class="menu-image">
                        <h2>${product.nombre}</h2>
                        <p class="product-description">${product.descripcion || 'Sin descripción disponible'}</p>
                        <p class="price">Precio: $${product.precio}</p>
                    `;
                    categoryContainer.appendChild(productCard);
                } else {
                    console.warn(`No se encontró un contenedor para la categoría ID: ${product.categoria_id}`);
                }
            }
        } else {
            console.error("Error al cargar los productos:", response.statusText);
        }
    } catch (error) {
        console.error("Error al conectar con el servidor para productos:", error);
    }
}

window.addEventListener("load", async () => {
    await loadCategories();
    await loadProducts();
});
