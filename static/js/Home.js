var menu = JSON.parse(localStorage.getItem("menu")) || []

function loadMenu() {
    menu.forEach(item => {
        let menuContainer = document.getElementById("menu")
        let div = document.createElement("div")
        let img = document.createElement("img")
        let h2 = document.createElement("h2")
        let p = document.createElement("p")
        let span = document.createElement("span")
        div.className = "menu-item"
        img.src = item.image
        img.className = "menu-image"
        h2.textContent = item.name
        p.textContent = item.description
        span.className = "price"
        span.textContent = "$" + item.productPrice

        div.appendChild(img)
        div.appendChild(h2)
        div.appendChild(p)
        div.appendChild(span)
        menuContainer.appendChild(div)
    })
}


window.addEventListener("load", () => {
    loadMenu()
})