

function loadMenu(){

    let menu = document.getElementById("menu")
    let div = document.createElement("div")
    let img = document.createElement("img")
    let h2 = document.createElement("h2")
    let p = document.createElement("p")
    let span = document.createElement("span")

    div.className = "menu-item"
    img.src="https://i.revistapym.com.co/cms/2023/10/04124555/16.png?w=480"
    h2.textContent = "Cerveza Aguila Light"
    p.textContent="Disfruta de una refrescante cerveza al mejor precio"
    span.className="price"
    span.textContent="$4.56"
    div.appendChild(img)
    div.appendChild(h2)
    div.appendChild(p)
    div.appendChild(span)
    menu.appendChild(div)
}


window.addEventListener("load",()=>{
    loadMenu()
})