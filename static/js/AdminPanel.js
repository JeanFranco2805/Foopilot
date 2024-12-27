const BASE_URL = "http://127.0.0.1:5000/api/categories";
const BASE_URL_PRODUCTS = "http://127.0.0.1:5000/api/products/productos";

document.addEventListener("DOMContentLoaded", () => {
    const categoriesContainer = document.getElementById("categories");
    const addCategoryBtn = document.getElementById("add-category-btn");
    const profilePicture = document.getElementById("profile-picture");
    const profilePictureInput = document.getElementById("profile-picture-input");
    const logoutButton = document.getElementById("logoutBtn")

    const createCategoryBlock = (name = "Nueva Categoría", persistInDB = true) => {
        const block = document.createElement("div");
        block.className = "category-block";
        block.textContent = name;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-category-btn";
        deleteBtn.textContent = "×";

        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const result = await Swal.fire({
                title: "¿Estás seguro?",
                text: "Esta acción eliminará la categoría.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
            });

            if (result.isConfirmed) {
                try {
                    const response = await fetch(BASE_URL + `/${name}`, {method: "DELETE"});
                    if (response.ok) {
                        block.remove();
                        Swal.fire("Eliminado", "La categoría fue eliminada exitosamente.", "success");
                    } else {
                        const error = await response.json();
                        Swal.fire("Error", `Error al eliminar la categoría: ${error.error}`, "error");
                    }
                } catch (err) {
                    Swal.fire("Error", "Error al conectar con el servidor.", "error");
                }
            }
        });

        block.addEventListener("dblclick", async () => {
            const {value: newName} = await Swal.fire({
                title: "Editar categoría",
                input: "text",
                inputLabel: "Nuevo nombre de la categoría",
                inputValue: block.textContent,
                showCancelButton: true,
                confirmButtonText: "Guardar",
                cancelButtonText: "Cancelar",
                inputValidator: (value) => {
                    if (!value.trim()) {
                        return "El nombre no puede estar vacío";
                    }
                },
            });

            if (newName) {
                try {
                    const response = await fetch(BASE_URL + `/${name}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({nuevo_nombre: newName.trim()}),
                    });

                    if (response.ok) {
                        block.textContent = newName.trim();
                        block.appendChild(deleteBtn);
                        Swal.fire("Actualizado", "La categoría fue actualizada exitosamente.", "success");
                    } else {
                        const error = await response.json();
                        Swal.fire("Error", `Error al actualizar la categoría: ${error.error}`, "error");
                    }
                } catch (err) {
                    Swal.fire("Error", "Error al conectar con el servidor.", "error");
                }
            }
        });

        block.appendChild(deleteBtn);
        categoriesContainer.appendChild(block);

        if (persistInDB) {
            insertCategoryToDB(name);
        }
    };

    const insertCategoryToDB = async (name) => {
        try {
            const response = await fetch(BASE_URL + `/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nombre_categoria: name}),
            });

            if (!response.ok) {
                const error = await response.json();
                Swal.fire("Error", `Error al agregar la categoría: ${error.error}`, "error");
                return false;
            }
            Swal.fire("Éxito", "Categoría agregada exitosamente.", "success");
            return true;
        } catch (err) {
            Swal.fire("Error", "Error al conectar con el servidor.", "error");
            return false;
        }
    };

    const loadCategoriesFromDB = async () => {
        try {
            const response = await fetch(BASE_URL + `/`, {method: "GET"});
            if (response.ok) {
                const categories = await response.json();
                categories.forEach((category) => {
                    createCategoryBlock(category.nombre_categoria, false);
                });
            } else {
                const error = await response.json();
                Swal.fire("Error", `Error al cargar categorías: ${error.error}`, "error");
            }
        } catch (err) {
            Swal.fire("Error", "Error al conectar con el servidor.", "error");
        }
    };

    addCategoryBtn.addEventListener("click", async () => {
        const {value: categoryName} = await Swal.fire({
            title: "Nueva categoría",
            input: "text",
            inputLabel: "Nombre de la categoría",
            inputPlaceholder: "Ingresa el nombre",
            showCancelButton: true,
            confirmButtonText: "Agregar",
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
                if (!value.trim()) {
                    return "El nombre no puede estar vacío";
                }
            },
        });

        if (categoryName) {
            createCategoryBlock(categoryName.trim());
        }
    });

    async function loadProducts() {
        const menuContainer = document.getElementById("menu");

        try {
            const response = await fetch(BASE_URL_PRODUCTS);
            if (!response.ok) {
                throw new Error("Error al obtener los productos del servidor");
            }

            const products = await response.json();
            menuContainer.innerHTML = "";

            products.forEach(product => {
                const div = document.createElement("div");
                div.className = "menu-item";
                div.setAttribute("data-id", product.id);

                const img = document.createElement("img");
                img.src = product.imagen || "https://via.placeholder.com/150";
                img.className = "menu-image";
                img.alt = product.nombre;

                const nameField = document.createElement("h2");
                nameField.textContent = product.nombre;
                nameField.onclick = () => toggleInput(nameField);

                const categoryField = document.createElement("p");
                categoryField.textContent = `Categoría: ${product.categoria_id}`;
                categoryField.onclick = () => toggleInput(categoryField);

                const priceField = document.createElement("span");
                priceField.className = "price";
                priceField.textContent = `$${product.precio}`;
                priceField.onclick = () => toggleInput(priceField);

                const details = document.createElement("div");
                details.className = "details";
                details.innerHTML = `<p><strong>ID:</strong> ${product.id}</p>`;

                const menuActions = document.createElement("div");
                menuActions.className = "menu-actions";

                const editBtn = document.createElement("button");
                editBtn.className = "edit-btn";
                editBtn.textContent = "Editar";
                editBtn.onclick = () => updateProduct(div, nameField, categoryField, priceField);

                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-btn";
                deleteBtn.textContent = "Eliminar";
                deleteBtn.onclick = () => deleteProduct(deleteBtn, product.id);

                menuActions.appendChild(editBtn);
                menuActions.appendChild(deleteBtn);

                div.appendChild(img);
                div.appendChild(nameField);
                div.appendChild(categoryField);
                div.appendChild(details);
                div.appendChild(priceField);
                div.appendChild(menuActions);

                menuContainer.appendChild(div);
            });
        } catch (error) {
            console.error("Error al cargar los productos:", error);
            Swal.fire("Error", "No se pudieron cargar los productos.", "error");
        }
    }

    async function deleteProduct(buttonElement, productId) {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará el producto.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${BASE_URL_PRODUCTS}/${productId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    const productItem = buttonElement.closest('.menu-item');
                    productItem.remove();
                    Swal.fire("Eliminado", "El producto fue eliminado exitosamente.", "success");
                } else {
                    const error = await response.json();
                    Swal.fire("Error", `Error al eliminar el producto: ${error.error}`, "error");
                }
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
                Swal.fire("Error", "No se pudo conectar con el servidor. Inténtalo más tarde.", "error");
            }
        }
    }

    profilePicture.addEventListener("click", () => {
        profilePictureInput.click();
    });

    profilePictureInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const base64Image = e.target.result;
                profilePicture.src = base64Image; // Actualizar visualmente la foto
                await updateProfilePicture(base64Image); // Enviar a la base de datos
            };

            reader.readAsDataURL(file);
        }
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
                        window.location.href = location.href
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

    async function loadEmployeeProfile() {
        const profileInfo = document.querySelector(".profile-info");
        const profilePicture = document.getElementById("profile-picture");
        try {
            const response = await fetch("http://127.0.0.1:5000/api/employee/current_user");
            if (!response.ok) throw new Error("No se pudo obtener los datos del empleado actual");

            const employee = await response.json();

            // Actualiza el nombre y cargo en el panel
            profileInfo.innerHTML = `
            <p><strong>${employee.nombre}</strong></p> <!-- Solo muestra el nombre -->
            <p>${employee.cargo}</p>
        `;

            if (employee.foto_perfil) {
                profilePicture.src = employee.foto_perfil; // Foto almacenada en formato Base64
            }
        } catch (error) {
            console.error("Error al cargar el perfil del empleado:", error);
            Swal.fire("Error", "No se pudo cargar el perfil del empleado.", "error");
        }
    }



    profilePicture.addEventListener("click", () => {
        profilePictureInput.click();
    });

    profilePictureInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                profilePicture.src = e.target.result;
            };

            reader.readAsDataURL(file);

            // Subir la nueva imagen al servidor
            uploadProfilePicture(file);
        }
    });

    async function uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append("foto_perfil", file);

        try {
            const response = await fetch("http://127.0.0.1:5000/api/employee/upload_profile_picture", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                Swal.fire("Éxito", "Foto de perfil actualizada.", "success");
            } else {
                const error = await response.json();
                Swal.fire("Error", `No se pudo actualizar la foto de perfil: ${error.error}`, "error");
            }
        } catch (error) {
            console.error("Error al subir la foto de perfil:", error);
            Swal.fire("Error", "No se pudo conectar con el servidor. Inténtalo más tarde.", "error");
        }
    }
    async function updateProfilePicture(base64Image) {
        try {
            const response = await fetch("/api/employee/update_profile_picture", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ foto_perfil: base64Image }),
            });

            if (response.ok) {
                Swal.fire("Éxito", "La foto de perfil se actualizó exitosamente.", "success");
            } else {
                const error = await response.json();
                Swal.fire("Error", `No se pudo actualizar la foto de perfil: ${error.error}`, "error");
            }
        } catch (error) {
            console.error("Error al actualizar la foto de perfil:", error);
            Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
        }
    }

    loadEmployeeProfile()
    loadProducts();
    loadCategoriesFromDB();
});
