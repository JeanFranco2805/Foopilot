
window.onload = ()=>{
    const button = document.getElementById("buttonSignUp")
    button.addEventListener("click", (event) => {
        event.preventDefault();
        const url = "http://127.0.0.1:5000/api/employee/add";
        const data = {
            "nombre": document.getElementById("name").value.trim(),
            "apellido": document.getElementById("lastname").value.trim(),
            "cargo": document.getElementById("role").value.trim(),
            "estado": document.getElementById("status").value,
            "fecha_contratacion": document.getElementById("hire-date").value || null, // Enviar null si no hay fecha
            "telefono": document.getElementById("phone").value.trim(),
            "correo": document.getElementById("email").value.trim(),
            "password": document.getElementById("password").value.trim(),
        };

        fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((error) => {
                        throw new Error(error.error || "Error desconocido");
                    });
                }
                return response.json();
            })
            .then((response) => {
                alert("Empleado agregado exitosamente.");
                console.log(response);
            })
            .catch((error) => {
                console.error("Error:", error.message);
                alert(`Error al agregar empleado: ${error.message}`);
            });
    });

}