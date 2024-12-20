window.onload = () => {
    const buttonLogin = document.getElementById("buttonLogin");
    const emailInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    buttonLogin.addEventListener("click", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            Swal.fire("Error", "Por favor, ingresa tu correo y contraseña.", "error");
            return;
        }

        const url = "http://127.0.0.1:5000/api/employee/login";
        const base_url = "http://127.0.0.1:5000/";
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                Swal.fire({
                    title: "Bienvenido",
                    text: `Bienvenido ${data.user.nombre} ${data.user.apellido}`,
                    icon: "success",
                    confirmButtonText: "Continuar"
                }).then(() => {
                    window.location.href = base_url + "home/employee/admin";
                });
            } else {
                const errorData = await response.json();
                Swal.fire("Error", errorData.error || "Error al iniciar sesión.", "error");
            }
        } catch (error) {
            console.error("Error al intentar iniciar sesión:", error);
            Swal.fire("Error", "Error en el servidor. Intenta más tarde.", "error");
        }
    });

    const buttonSignUp = document.getElementById("buttonSignUp");
    buttonSignUp.addEventListener("click", async (event) => {
        event.preventDefault();
        const url = "http://127.0.0.1:5000/api/employee/add";
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
