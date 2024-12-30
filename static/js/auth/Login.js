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

        const url = "/api/employee/login";
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
                    window.location.href = `${window.location.origin}/home/employee/admin`;
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
};
