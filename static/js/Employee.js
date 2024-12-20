document.addEventListener("DOMContentLoaded", async () => {
    const BASE_URL = "http://127.0.0.1:5000/api/employee";

    const tableBody = document.querySelector(".users-table tbody");
    const logoutButton = document.getElementById("logoutButton");

    const makeEditable = (cell, callback) => {
        const originalText = cell.textContent.trim();
        const input = document.createElement("input");
        input.type = "text";
        input.value = originalText;
        input.classList.add("editable-input");

        cell.textContent = "";
        cell.appendChild(input);

        input.focus();

        input.addEventListener("blur", () => {
            const newValue = input.value.trim();
            cell.textContent = newValue;

            if (newValue !== originalText && callback) {
                callback(newValue);
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                input.blur();
            }
        });
    };

    const loadTableData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/all`, { method: "GET" });
            if (!response.ok) {
                throw new Error("Error al cargar los datos de la tabla");
            }
            const users = await response.json();

            tableBody.innerHTML = "";

            users.forEach((user) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${user.nombre}</td>
                    <td>${user.correo}</td>
                    <td>${user.cargo}</td>
                    <td>${user.estado}</td>
                    <td>
                        <button class="edit-btn">Actualizar</button>
                        <button class="delete-btn">Eliminar</button>
                    </td>
                `;

                const cells = row.querySelectorAll("td:not(:last-child)");
                cells.forEach((cell, index) => {
                    cell.addEventListener("dblclick", () => {
                        const fieldName = ["nombre", "correo", "cargo", "estado"][index];
                        makeEditable(cell, async (newValue) => {
                            try {
                                const payload = { [fieldName]: newValue };
                                const response = await fetch(`${BASE_URL}/email/${user.correo}`, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(payload),
                                });

                                if (response.ok) {
                                    Swal.fire("Éxito", `${fieldName} actualizado exitosamente`, "success");
                                } else {
                                    throw new Error("Error al actualizar el campo");
                                }
                            } catch (error) {
                                Swal.fire("Error", "No se pudo actualizar el campo", "error");
                                console.error(error);
                                cell.textContent = user[fieldName];
                            }
                        });
                    });
                });

                tableBody.appendChild(row);
            });

            attachEventHandlers();
        } catch (error) {
            console.error("Error al cargar datos:", error);
            Swal.fire("Error", "No se pudieron cargar los datos de los empleados.", "error");
        }
    };

    const attachEventHandlers = () => {
        const editButtons = document.querySelectorAll(".edit-btn");
        editButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                const row = button.closest("tr");
                const userData = {
                    nombre: row.querySelector("td:nth-child(1)").textContent.trim(),
                    correo: row.querySelector("td:nth-child(2)").textContent.trim(),
                    cargo: row.querySelector("td:nth-child(3)").textContent.trim(),
                    estado: row.querySelector("td:nth-child(4)").textContent.trim(),
                };

                const { value: confirmEdit } = await Swal.fire({
                    title: "¿Actualizar usuario?",
                    text: `¿Estás seguro de actualizar la información de ${userData.correo}?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Sí, actualizar",
                    cancelButtonText: "Cancelar",
                });

                if (confirmEdit) {
                    try {
                        const response = await fetch(`${BASE_URL}/email/${userData.correo}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(userData),
                        });

                        if (response.ok) {
                            Swal.fire("Éxito", "Usuario actualizado exitosamente", "success");
                        } else {
                            throw new Error("Error al actualizar el usuario");
                        }
                    } catch (error) {
                        Swal.fire("Error", "No se pudo actualizar el usuario", "error");
                        console.error(error);
                    }
                }
            });
        });

        const deleteButtons = document.querySelectorAll(".delete-btn");
        deleteButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                const row = button.closest("tr");
                const email = row.querySelector("td:nth-child(2)").textContent.trim();

                const result = await Swal.fire({
                    title: "¿Eliminar usuario?",
                    text: `¿Estás seguro de eliminar a ${email}?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar",
                });

                if (result.isConfirmed) {
                    try {
                        const response = await fetch(`${BASE_URL}/delete`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ email: email }),
                        });

                        if (response.ok) {
                            row.remove();
                            Swal.fire("Eliminado", "El usuario fue eliminado exitosamente", "success");
                        } else {
                            throw new Error("Error al eliminar el usuario");
                        }
                    } catch (error) {
                        Swal.fire("Error", "No se pudo eliminar el usuario", "error");
                        console.error(error);
                    }
                }
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
    };

    await loadTableData();
});
