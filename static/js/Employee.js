document.addEventListener("DOMContentLoaded", async () => {
    const BASE_URL = "/api/employee";

    const tableBody = document.querySelector(".users-table tbody");
    const logoutButton = document.getElementById("logoutButton");
    const searchInput = document.getElementById("searchInput");

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

    let currentPage = 1;
    const recordsPerPage = 5;
    let users = [];

    const loadTableData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/all`, { method: "GET" });
            if (!response.ok) throw new Error("Error al cargar los datos de la tabla");
            users = await response.json();
            users.sort((a, b) => a.nombre.localeCompare(b.nombre));
            renderTable(users, currentPage);
            generatePagination(users.length);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            Swal.fire("Error", "No se pudieron cargar los datos de los empleados.", "error");
        }
    };

    const renderTable = (data, page) => {
        const startIndex = (page - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedData = data.slice(startIndex, endIndex);

        tableBody.innerHTML = "";

        paginatedData.forEach((user) => {
            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${user.nombre} ${user.apellido}</td>
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
    };


    const generatePagination = (totalRecords) => {
        const totalPages = Math.ceil(totalRecords / recordsPerPage);
        const paginationContainer = document.querySelector(".pagination-container");
        paginationContainer.innerHTML = "";

        const firstPageButton = document.createElement("button");
        firstPageButton.textContent = "Primera";
        firstPageButton.disabled = currentPage === 1;
        firstPageButton.addEventListener("click", () => {
            currentPage = 1;
            renderTable(users, currentPage);
            generatePagination(users.length);
        });
        paginationContainer.appendChild(firstPageButton);

        const prevButton = document.createElement("button");
        prevButton.textContent = "Anterior";
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable(users, currentPage);
                generatePagination(users.length);
            }
        });
        paginationContainer.appendChild(prevButton);

        const pageButtonsRange = 5;
        const startPage = Math.max(1, currentPage - Math.floor(pageButtonsRange / 2));
        const endPage = Math.min(totalPages, startPage + pageButtonsRange - 1);

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add("active");
            }
            pageButton.addEventListener("click", () => {
                currentPage = i;
                renderTable(users, currentPage);
                generatePagination(users.length);
            });
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.textContent = "Siguiente";
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable(users, currentPage);
                generatePagination(users.length);
            }
        });
        paginationContainer.appendChild(nextButton);
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
                    const response = await fetch("/auth/logout", {
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
    const profilePicture = document.getElementById("profile-picture");
    const profileInfo = document.querySelector(".profile-info");

    async function loadUserProfile() {
        try {
            const response = await fetch("/api/employee/current_user");
            if (!response.ok) throw new Error("No se pudo obtener los datos del usuario actual");

            const user = await response.json();

            if (user.foto_perfil) {
                profilePicture.src = user.foto_perfil;
            }
            profileInfo.innerHTML = `
                <p><strong>${user.nombre}</strong></p>
                <p>${user.cargo}</p>
            `;
        } catch (error) {
            console.error("Error al cargar el perfil del usuario:", error);
            Swal.fire("Error", "No se pudo cargar el perfil del usuario.", "error");
        }
    }
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
                        const response = await fetch("/api/employee/update_photo", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ foto_perfil: base64Image }),
                        });

                        if (response.ok) {
                            Swal.fire("Éxito", "Foto de perfil actualizada correctamente.", "success");
                            profilePicture.src = base64Image;
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


    const filterData = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredUsers = users.filter(user =>
            user.nombre.toLowerCase().includes(searchTerm) ||
            user.correo.toLowerCase().includes(searchTerm) ||
            user.cargo.toLowerCase().includes(searchTerm) ||
            user.estado.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredUsers, 1);
        generatePagination(filteredUsers.length);
    };

    searchInput.addEventListener("input", filterData);
    loadUserProfile();
    await loadTableData();
});
