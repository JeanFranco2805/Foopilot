const BASE_URL_PRODUCTS = "http://127.0.0.1:5000/api/products";
const BASE_URL_CATEGORIES = "http://127.0.0.1:5000/api/categories";

async function fetchCategoryName(categoryId) {
    try {
        const response = await fetch(`${BASE_URL_CATEGORIES}/${categoryId}`);
        if (response.ok) {
            const category = await response.json();
            return category.nombre_categoria;
        } else {
            console.error(`Error al obtener la categoría ${categoryId}:`, response.statusText);
            return "Desconocida";
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        return "Desconocida";
    }
}

async function fetchMenuFromServer() {
    try {
        const response = await fetch(`${BASE_URL_PRODUCTS}/productos`);
        if (response.ok) {
            const menu = await response.json();
            return menu;
        } else {
            console.error("Error al cargar los menús:", response.statusText);
            return [];
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        return [];
    }
}

async function loadMenu() {
    const menu = await fetchMenuFromServer();
    const menuContainer = document.getElementById("menu");

    for (const item of menu) {
        const categoryName = await fetchCategoryName(item.categoria_id);

        let div = document.createElement("div");
        let img = document.createElement("img");
        let h2 = document.createElement("h2");
        let p = document.createElement("p");
        let span = document.createElement("span");

        div.className = "menu-item";
        img.src = item.imagen || "https://via.placeholder.com/150"; // Muestra la imagen correcta
        img.alt = item.nombre;
        img.className = "menu-image";
        h2.textContent = item.nombre;
        p.textContent = "Categoría: " + categoryName;
        span.className = "price";
        span.textContent = "$" + item.precio;

        div.appendChild(img);
        div.appendChild(h2);
        div.appendChild(p);
        div.appendChild(span);

        menuContainer.appendChild(div);
    }
}


window.addEventListener("load", () => {
    loadMenu();
});
