document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const rows = document.querySelectorAll(".history-table tbody tr");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.getAttribute("data-filter");

            rows.forEach(row => {
                const state = row.cells[4].textContent.toLowerCase(); // Estado
                row.style.display = (filter === "todos" || state === filter) ? "" : "none";
            });
        });
    });
});
