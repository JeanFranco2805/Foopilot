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

function handleSubmit(event) {
    event.preventDefault();
    let productName = document.getElementById("product-name");
    let productDesc = document.getElementById("product-description");
    let img = document.getElementById("product-image");
    let price = document.getElementById("product-price");
    if (productName && productDesc && img && price) {
        menu.push({
            name: productName.value,
            description: productDesc.value,
            image: url,
            productPrice: price.value
        });

        localStorage.setItem("menu", JSON.stringify(menu));
    } else {
        console.error("Algunos elementos del formulario no se encontraron.");
    }
}

window.addEventListener("load", () => {
    load();
});
