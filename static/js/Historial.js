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
});
