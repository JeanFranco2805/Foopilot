document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const rows = document.querySelectorAll(".history-table tbody tr");
    const logoutButton = document.getElementById("logoutButton");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.getAttribute("data-filter");

            rows.forEach(row => {
                const state = row.cells[4].textContent.toLowerCase(); // Estado
                row.style.display = (filter === "todos" || state === filter) ? "" : "none";
            });
        });
    });
    logoutButton.addEventListener("click", async () => {
        const result = await Swal.fire({
            title: "¿Cerrar sesión?",
            text: "¿Estás seguro de que deseas cerrar sesión?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch("http://127.0.0.1:5000/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });

                if (response.ok) {
                    Swal.fire("Sesión cerrada", "Has cerrado sesión exitosamente.", "success").then(() => {
                        window.location.href=  location.href
                    });
                } else {
                    const error = await response.json();
                    Swal.fire("Error", `No se pudo cerrar la sesión: ${error.message}`, "error");
                }
            } catch (error) {
                Swal.fire("Error", "Error al intentar cerrar sesión. Inténtalo más tarde.", "error");
                console.error("Error al cerrar sesión:", error);
            }
        }
    });
    const profilePicture = document.getElementById("profile-picture");
    const profileInfo = document.querySelector(".profile-info");

    // Función para cargar la foto de perfil, nombre y cargo del usuario actual
    async function loadUserProfile() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/employee/current_user");
            if (!response.ok) throw new Error("No se pudo obtener los datos del usuario actual");

            const user = await response.json();

            // Actualizar foto de perfil si existe
            if (user.foto_perfil) {
                profilePicture.src = user.foto_perfil; // Foto almacenada en formato Base64
            }

            // Actualizar información de perfil
            profileInfo.innerHTML = `
                <p><strong>${user.nombre}</strong></p>
                <p>${user.cargo}</p>
            `;
        } catch (error) {
            console.error("Error al cargar el perfil del usuario:", error);
            Swal.fire("Error", "No se pudo cargar el perfil del usuario.", "error");
        }
    }

    // Función para actualizar la foto de perfil en la base de datos
    profilePicture.addEventListener("dblclick", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";

        fileInput.addEventListener("change", async () => {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();

                reader.onload = async (e) => {
                    const base64Image = e.target.result;

                    try {
                        const response = await fetch("http://127.0.0.1:5000/api/employee/update_photo", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ foto_perfil: base64Image }),
                        });

                        if (response.ok) {
                            Swal.fire("Éxito", "Foto de perfil actualizada correctamente.", "success");
                            profilePicture.src = base64Image; // Actualizar visualmente
                        } else {
                            const error = await response.json();
                            Swal.fire("Error", `Error al actualizar la foto: ${error.error}`, "error");
                        }
                    } catch (err) {
                        console.error("Error al actualizar la foto:", err);
                        Swal.fire("Error", "No se pudo actualizar la foto de perfil.", "error");
                    }
                };

                reader.readAsDataURL(file);
            }
        });

        fileInput.click();
    });
    loadUserProfile();
});
