let btn = null;
let menu = JSON.parse(localStorage.getItem("menu")) || []
let file = null
let url
function load() {
    btn = document.getElementById("btnSubmit");
    let productImg = document.getElementById("product-image")
    btn.addEventListener("click", handleSubmit);
    productImg.addEventListener("change", (files) => {
        file = files.target.files[0]

        const reader = new FileReader()
        reader.onload = function (e) {
           url =  e.target.result
        }
        reader.readAsDataURL(file)

    })
}

async function handleSubmit(event) {
    event.preventDefault();

    let productName = document.getElementById("product-name");
    let productDesc = document.getElementById("product-description");
    let price = parseFloat(document.getElementById("product-price").value);

    if (productName && productDesc && file && price) {
        const producto = {
            nombre: productName.value,
            descripcion: productDesc.value,
            precio: price,
            categoria_id: 1,
        };

        try {
            const response = await fetch('/api/menu/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producto),
            });

            if (response.ok) {
                alert('Producto agregado exitosamente.');
                cargarProductos();
            } else {
                const error = await response.json();
                console.error('Error al agregar el producto:', error);
                alert('Error al agregar el producto.');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('Error al conectar con el servidor.');
        }
    } else {
        console.error("Algunos elementos del formulario no se encontraron.");
    }
}

async function cargarProductos() {
    try {
        const response = await fetch('/api/menu/list');
        const productos = await response.json();

        const contenedor = document.getElementById("product-list");
        contenedor.innerHTML = '';

        productos.forEach(producto => {
            const item = document.createElement('div');
            item.className = 'producto';
            item.innerHTML = `
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio.toFixed(2)}</p>
            `;
            contenedor.appendChild(item);
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

window.addEventListener("load", () => {
    load();
});
