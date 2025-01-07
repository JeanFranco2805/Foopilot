window.onload = () => {
    const buttonSignUp = document.getElementById("buttonSignUp");
    const form = document.getElementById("registerForm");

    buttonSignUp.addEventListener("click", async (event) => {
        event.preventDefault();

        // Validación de contraseñas
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (password !== confirmPassword) {
            Swal.fire("Error", "Las contraseñas no coinciden. Por favor, verifícalas.", "error");
            return; // Detiene la ejecución si las contraseñas no coinciden
        }

        // Validación de correo electrónico
        const email = document.getElementById("email").value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar correos
        if (!emailRegex.test(email)) {
            Swal.fire("Error", "Por favor, ingrese un correo electrónico válido.", "error");
            return; // Detiene la ejecución si el correo no es válido
        }

        const url = "/api/employee/add";
        const data = {
            "nombre": document.getElementById("name").value.trim(),
            "apellido": document.getElementById("lastname").value.trim(),
            "cargo": document.getElementById("role").value.trim(),
            "estado": "Activo", // Forzamos el estado a "Activo"
            "fecha_contratacion": document.getElementById("hire-date").value || null,
            "telefono": document.getElementById("phone").value.trim(),
            "correo": email, // Usamos el correo validado
            "password": password, // Usamos la contraseña validada
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
                }).then(() => {
                    switchToViewMode(); // Cambiar a modo visualización tras el registro
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

    const switchToViewMode = () => {
        const inputs = form.querySelectorAll("input, select");
        inputs.forEach(input => input.disabled = true);
        buttonSignUp.style.display = "none"; // Oculta el botón de crear cuenta

        const editButton = document.createElement("button");
        editButton.textContent = "Editar";
        editButton.className = "btn btn-edit"; // Clase de estilo para botón Editar
        editButton.addEventListener("click", () => {
            inputs.forEach(input => input.disabled = false);
            buttonSignUp.style.display = "block"; 
            editButton.remove();
            backButton.remove();
        });

        // Botón "Regresar a la Lista"
        const backButton = document.createElement("a");
        backButton.textContent = "Regresar a la Lista";
        backButton.href = "/";
        backButton.className = "btn btn-back"; // Clase de estilo para botón Regresar

        // Contenedor para los botones
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container"; // Clase de estilo para alinear los botones

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(backButton);
        form.parentElement.appendChild(buttonContainer); // Añadir los botones al formulario
    };
};
