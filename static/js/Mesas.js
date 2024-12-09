window.onload = () => {
    const menuItems = document.querySelector('.menu-items');
    const addCardBtn = document.getElementById('add-card-btn');

    function loadTables() {
        const savedTables = JSON.parse(localStorage.getItem('tables')) || [];
        menuItems.innerHTML = '';
        savedTables.forEach((table, index) => {
            const newCard = `
        <div class="menu-item" data-id="${index + 1}">
            <img class="menu-image" src="https://http2.mlstatic.com/D_NQ_NP_881059-MLM42193027710_062020-O.webp" alt="Mesa">
            <h3>Mesa #${index + 1}</h3>
            <p class="state"><strong>Estado:</strong> ${table.state}</p>
            <p class="waiter"><strong>Mesero:</strong> ${table.waiter}</p>
              <div class="menu-actions">
                <button class="edit-btn">Atender</button>
                <button class="delete-btn">Eliminar</button>
            </div>
        </div>`;
            menuItems.insertAdjacentHTML('beforeend', newCard);
        });

    }

    function saveTables() {
        const tables = [];
        menuItems.querySelectorAll('.menu-item').forEach((item) => {
            const stateEl = item.querySelector('.state');
            const waiterEl = item.querySelector('.waiter');

            if (stateEl && waiterEl) {
                const state = stateEl.textContent.split(': ')[1].trim() || 'Desocupada';
                const waiter = waiterEl.textContent.split(': ')[1].trim() || 'Ninguno';
                tables.push({state, waiter});
            } else {
                tables.push({state: 'Desocupada', waiter: 'Ninguno'});
            }
        });
        localStorage.setItem('tables', JSON.stringify(tables));
        console.log(tables);
    }


    addCardBtn.addEventListener('click', () => {
        const newCardNumber = menuItems.children.length + 1;

        const newCard = `
    <div class="menu-item" data-id="${newCardNumber}">
        <img class="menu-image" src="https://http2.mlstatic.com/D_NQ_NP_881059-MLM42193027710_062020-O.webp" alt="Mesa">
        <h3>Mesa #${newCardNumber}</h3>
         <p class="state"><strong>Estado:</strong> Desocupada</p>
            <p class="waiter"><strong>Mesero:</strong> Ninguno</p>
        <div class="menu-actions">
                <button class="edit-btn">Atender</button>
                <button class="delete-btn">Eliminar</button>
        </div>
    </div>`;
        menuItems.insertAdjacentHTML('beforeend', newCard);
        saveTables();
    });

    menuItems.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const card = event.target.closest('.menu-item');
            const stateEl = card.querySelector('.state');
            const waiterEl = card.querySelector('.waiter');

            if (stateEl.textContent.includes('Desocupada')) {
                stateEl.innerHTML = '<p class="state"><strong>Estado:</strong> Atendida</p>'
                waiterEl.innerHTML ='<p class="waiter"><strong>Mesero:</strong> Juan Perez</p>'
            } else {
                stateEl.innerHTML = '<p class="state"><strong>Estado:</strong> Desocupada</p>'
                waiterEl.innerHTML ='<p class="waiter"><strong>Mesero:</strong>Ninguno</p>'
            }
            saveTables();
        }
        if (event.target.classList.contains('delete-btn')) {
            const card = event.target.closest('.menu-item');
            const cardIndex = Array.from(menuItems.children).indexOf(card);
            card.remove();

            const savedTables = JSON.parse(localStorage.getItem('tables')) || [];
            savedTables.splice(cardIndex, 1);
            localStorage.setItem('tables', JSON.stringify(savedTables));
        }
    });
    loadTables()
};
