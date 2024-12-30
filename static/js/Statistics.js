const API_BASE_URL = "http://127.0.0.1:5000/api"; // Cambia esto según la URL de tu API

async function loadStatistics() {
    try {
        const statsResponse = await fetch(`${API_BASE_URL}/stats/statistics`);
        const stats = await statsResponse.json();

        const empleadoDelMes = stats.empleado_mes || {nombre: "Desconocido", total_pedidos: 0};
        document.querySelector(".stat-card:nth-child(1) p").textContent = empleadoDelMes.nombre;
        document.querySelector(".stat-card:nth-child(1) span").textContent = `${empleadoDelMes.total_pedidos} Ventas`;

        const productoMasVendido = stats.producto_mas_vendido || {nombre: "Desconocido", unidades: 0};
        document.querySelector(".stat-card:nth-child(2) p").textContent = productoMasVendido.nombre;
        document.querySelector(".stat-card:nth-child(2) span").textContent = `${productoMasVendido.unidades} Unidades`;

        const pedidosResponse = await fetch(`${API_BASE_URL}/orders/all`);
        const pedidos = await pedidosResponse.json();

        const totalIngresos = pedidos.reduce((acc, pedido) => acc + parseFloat(pedido.Total || 0), 0);
        document.querySelector(".stat-card:nth-child(3) p").textContent = `$${totalIngresos.toFixed(2)}`;
    } catch (error) {
        console.error("Error al cargar las estadísticas:", error);
    }
}

async function loadCharts() {
    try {
        const pedidosResponse = await fetch(`${API_BASE_URL}/orders/all`);
        const pedidos = await pedidosResponse.json();

        const ventasPorMes = {};
        pedidos.forEach((pedido) => {
            const mes = new Date(pedido.fecha_hora).toLocaleString("es-ES", {month: "long"});
            ventasPorMes[mes] = (ventasPorMes[mes] || 0) + parseFloat(pedido.Total || 0);
        });

        const salesChart = document.getElementById("sales-chart").getContext("2d");
        new Chart(salesChart, {
            type: "bar",
            data: {
                labels: Object.keys(ventasPorMes),
                datasets: [
                    {
                        label: "Ingresos por mes",
                        data: Object.values(ventasPorMes),
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {display: true},
                    tooltip: {mode: "index"},
                },
            },
        });

        const detallesResponse = await fetch(`${API_BASE_URL}/orders/details`);
        const detalles = await detallesResponse.json();

        const productosVendidos = {};

        detalles.forEach((pedido) => {
            pedido.productos.forEach((producto) => {
                if (!productosVendidos[producto.nombre]) {
                    productosVendidos[producto.nombre] = 0;
                }
                productosVendidos[producto.nombre] += producto.cantidad;
            });
        });

        const totalUnidadesVendidas = Object.values(productosVendidos).reduce((acc, cantidad) => acc + cantidad, 0);

        const labels = Object.keys(productosVendidos);
        const data = Object.values(productosVendidos);

        const productsChart = document.getElementById("products-chart").getContext("2d");
        new Chart(productsChart, {
            type: "pie",
            data: {
                labels,
                datasets: [
                    {
                        label: "Productos más vendidos",
                        data,
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.6)",
                            "rgba(54, 162, 235, 0.6)",
                            "rgba(255, 206, 86, 0.6)",
                            "rgba(75, 192, 192, 0.6)",
                            "rgba(153, 102, 255, 0.6)",
                            "rgba(255, 159, 64, 0.6)",
                        ],
                        borderColor: [
                            "rgba(255, 99, 132, 1)",
                            "rgba(54, 162, 235, 1)",
                            "rgba(255, 206, 86, 1)",
                            "rgba(75, 192, 192, 1)",
                            "rgba(153, 102, 255, 1)",
                            "rgba(255, 159, 64, 1)",
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {display: true},
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const porcentaje = ((data[index] / totalUnidadesVendidas) * 100).toFixed(2);
                                return `${labels[index]}: ${data[index]} unidades (${porcentaje}%)`;
                            },
                        },
                    },
                },
            },
        });
    } catch (error) {
        console.error("Error al cargar los gráficos:", error);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const profilePicture = document.getElementById("profile-picture");
    const profilePictureInput = document.getElementById("profile-picture-input");
    const logoutButton = document.getElementById("logoutBtn")

    profilePicture.addEventListener("click", () => {
        profilePictureInput.click();
    });

    profilePictureInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const base64Image = e.target.result;
                profilePicture.src = base64Image;
                await updateProfilePicture(base64Image);
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
            profileInfo.innerHTML = `
            <p><strong>${employee.nombre}</strong></p> 
            <p>${employee.cargo}</p>
        `;

            if (employee.foto_perfil) {
                profilePicture.src = employee.foto_perfil;
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
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({foto_perfil: base64Image}),
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


    loadStatistics();
    loadCharts();
    loadEmployeeProfile();

});
