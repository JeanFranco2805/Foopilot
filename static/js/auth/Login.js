window.onload = () => {
    const buttonLogin = document.getElementById("buttonLogin");
    const emailInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    buttonLogin.addEventListener("click", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Por favor, ingresa tu correo y contraseña.");
            return;
        }

        const url = "http://127.0.0.1:5000/api/employee/login";
        const base_url = "http://127.0.0.1:5000/"
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
                alert(`Bienvenido ${data.nombre} ${data.apellido}`);
                window.location.href=base_url+"home/employee/admin"
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Error al iniciar sesión.");
            }
        } catch (error) {
            console.error("Error al intentar iniciar sesión:", error);
            alert("Error en el servidor. Intenta más tarde.");
        }
    });
};
