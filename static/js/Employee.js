document.addEventListener("DOMContentLoaded", async () => {
    const BASE_URL = "http://127.0.0.1:5000/api/employee";

    const tableBody = document.querySelector(".users-table tbody");

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
                    <td>${user.password}</td>
                    <td>${user.estado}</td>
                    <td>
                        <button class="edit-btn">Actualizar</button>
                        <button class="delete-btn">Eliminar</button>
                    </td>
                `;

                const cells = row.querySelectorAll("td:not(:last-child)");
                cells.forEach((cell, index) => {
                    cell.addEventListener("dblclick", () => {
                        const fieldName = ["nombre", "correo", "password", "estado"][index];
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
                                    alert(`${fieldName} actualizado exitosamente`);
                                } else {
                                    throw new Error("Error al actualizar el campo");
                                }
                            } catch (error) {
                                alert("No se pudo actualizar el campo");
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
            alert("No se pudieron cargar los datos de los empleados.");
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
                    password: row.querySelector("td:nth-child(3)").textContent.trim(),
                    estado: row.querySelector("td:nth-child(4)").textContent.trim(),
                };

                try {
                    const response = await fetch(`${BASE_URL}/email/${userData.correo}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(userData),
                    });

                    if (response.ok) {
                        alert("Usuario actualizado exitosamente");
                    } else {
                        throw new Error("Error al actualizar el usuario");
                    }
                } catch (error) {
                    alert("No se pudo actualizar el usuario");
                    console.error(error);
                }
            });
        });

        const deleteButtons = document.querySelectorAll(".delete-btn");
        deleteButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                const row = button.closest("tr");
                const email = row.querySelector("td:nth-child(2)").textContent.trim();
                const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar a ${email}?`);

                if (confirmDelete) {
                    try {
                        const response = await fetch(`${BASE_URL}/delete`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ "email":email }),
                        });
                    } catch (error) {
                        alert("No se pudo eliminar el usuario");
                        console.error(error);
                    }
                }
            });
        });
    };
    await loadTableData();
});
