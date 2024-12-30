document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = {
            nombre: document.getElementById("nombre").value.trim(),
            apellido: document.getElementById("apellido").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            telefono: document.getElementById("telefono").value.trim(),
            password: document.getElementById("password").value.trim(),
            cargo: "N/A",
            estado:'Activo'
        };

        try {
            const response = await fetch("/api/employee/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    title: "Éxito",
                    text: `Empleado registrado con éxito. ID: ${result.empleado_id}`,
                    icon: "success",
                });
                form.reset();
            } else {
                const error = await response.json();
                Swal.fire("Error", error.error || "No se pudo registrar el empleado.", "error");
            }
        } catch (error) {
            console.error("Error al registrar empleado:", error);
            Swal.fire("Error", "Error al conectar con el servidor.", "error");
        }
    });
});
