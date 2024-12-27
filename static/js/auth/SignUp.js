window.onload = () => {

    const buttonSignUp = document.getElementById("buttonSignUp");
    buttonSignUp.addEventListener("click", async (event) => {
        event.preventDefault();
        const url = "/api/employee/add";
        const data = {
            "nombre": document.getElementById("name").value.trim(),
            "apellido": document.getElementById("lastname").value.trim(),
            "cargo": document.getElementById("role").value.trim(),
            "estado": document.getElementById("status").value,
            "fecha_contratacion": document.getElementById("hire-date").value || null,
            "telefono": document.getElementById("phone").value.trim(),
            "correo": document.getElementById("email").value.trim(),
            "password": document.getElementById("password").value.trim(),
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                Swal.fire({
                    title: "Éxito",
                    text: "Empleado agregado exitosamente.",
                    icon: "success",
                    confirmButtonText: "Continuar"
                });
                console.log(responseData);
            } else {
                const errorData = await response.json();
                Swal.fire("Error", errorData.error || "Error desconocido al agregar el empleado.", "error");
            }
        } catch (error) {
            console.error("Error:", error.message);
            Swal.fire("Error", `Error al agregar empleado: ${error.message}`, "error");
        }
    });
};
