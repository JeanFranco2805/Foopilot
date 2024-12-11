
window.onload = ()=>{
    const button = document.getElementById("buttonSignUp")
    button.addEventListener("click", ()=>{
        const url = "http://127.0.0.1:5000/api/employee/register";
        const data = {
            "nombre": "Angel De Jesus",
            "apellido": "Quintero Rivera",
            "cargo": "Mesero",
            "estado": "Activo",
            "fecha_contratacion": null,
            "telefono": "3013543650"
        }
        fetch(url, {
            method:"POST",
            body:JSON.stringify(data),
            headers:{
                "content-type":"application/json"
            }
        }).then(r =>{
            console.log(r.text())
        })
    })
}