// Початкові записи зберігаються в JavaScript, а не в HTML-рядках.
    const seedData = {
  "version": 1,
  "books": [
    [
      "B001",
      "Місто на пагорбі",
      "Олена Коваль",
      "Роман",
      "2022",
      "240",
      "4"
    ],
    [
      "B002",
      "Таємниця старого маяка",
      "Андрій Лісовий",
      "Детектив",
      "2023",
      "192",
      "3"
    ],
    [
      "B003",
      "Подорож до зірок",
      "Марія Зоряна",
      "Фантастика",
      "2024",
      "320",
      "5"
    ]
  ],
  "readers": [
    [
      "R001",
      "Петренко Ірина Олегівна",
      "2005",
      "iryna@example.com",
      "2026-09-01",
      "Студент",
      "5"
    ],
    [
      "R002",
      "Савченко Максим Іванович",
      "1987",
      "maksym@example.com",
      "2026-09-10",
      "Викладач",
      "10"
    ],
    [
      "R003",
      "Мельник Анна Сергіївна",
      "2010",
      "anna@example.com",
      "2026-10-02",
      "Школяр",
      "3"
    ]
  ],
  "loans": [
    [
      "L001",
      "B001",
      "R001",
      "2026-10-20",
      "2026-11-03",
      "2026-11-01",
      "Добрий"
    ],
    [
      "L002",
      "B002",
      "R002",
      "2026-11-01",
      "2026-11-15",
      "Ще не повернуто",
      "Новий"
    ],
    [
      "L003",
      "B003",
      "R003",
      "2026-11-03",
      "2026-11-17",
      "Ще не повернуто",
      "Добрий"
    ]
  ]
};

    function renderInitialTables() {
      ['books', 'readers', 'loans'].forEach(function (id) {
        const tbody = document.querySelector('#' + id + ' tbody');
        tbody.replaceChildren();
        seedData[id].forEach(function (record) {
          const row = document.createElement('tr');
          record.forEach(function (value) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
          });
          tbody.appendChild(row);
        });
      });
    }
    renderInitialTables();

    // defer виконує скрипт після розбору HTML, коли елементи вже доступні в DOM.
    const tabs = document.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');

    function activateTab(selectedTab) {
      // Позначаємо активну вкладку й оновлюємо навігацію клавішею Tab.
      tabs.forEach(function (tab) {
        const isSelected = tab === selectedTab;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
      });

      // Показуємо лише панель, пов'язану з обраною вкладкою.
      const panelId = selectedTab.getAttribute('aria-controls');
      panels.forEach(function (panel) {
        panel.hidden = panel.id !== panelId;
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activateTab(tab);
      });

      // Додатково підтримуємо стрілки, Home і End для клавіатури.
      tab.addEventListener('keydown', function (event) {
        let nextIndex = index;
        if (event.key === 'ArrowRight') {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft') {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }
        event.preventDefault();
        activateTab(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });

    // Форми працюють без бібліотек. Дані зберігаються лише до оновлення сторінки.
    const booksForm = document.getElementById('books-form');
    const readersForm = document.getElementById('readers-form');
    const loansForm = document.getElementById('loans-form');
    const currentYear = new Date().getFullYear();
    booksForm.elements.year.max = currentYear;
    readersForm.elements.birthYear.max = currentYear;

    // Варіанти для видачі беремо з таблиць, зокрема з нових рядків.
    function fillOptions(select, panelId) {
      const previousValue = select.value;
      while (select.options.length > 1) {
        select.remove(1);
      }
      document.querySelectorAll('#' + panelId + ' tbody tr').forEach(function (row) {
        const option = document.createElement('option');
        option.value = row.cells[0].textContent;
        option.textContent = option.value + ' — ' + row.cells[1].textContent;
        select.appendChild(option);
      });
      select.value = previousValue;
    }

    function updateLoanOptions() {
      fillOptions(loansForm.elements.book, 'books');
      fillOptions(loansForm.elements.reader, 'readers');
    }

    function showError(input, message) {
      input.setCustomValidity(message);
      input.reportValidity();
      input.focus();
    }

    function setupForm(form, panelId, fieldNames) {
      const tbody = document.querySelector('#' + panelId + ' tbody');
      const message = form.querySelector('.message');

      // Після редагування прибираємо попередню помилку, щоб можна було повторити спробу.
      form.addEventListener('input', function () {
        fieldNames.forEach(function (name) {
          form.elements[name].setCustomValidity('');
        });
        message.textContent = '';
      });
      form.addEventListener('reset', function () {
        fieldNames.forEach(function (name) {
          form.elements[name].setCustomValidity('');
        });
        message.textContent = '';
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault(); // Додавання без перезавантаження сторінки.
        message.textContent = '';

        // Прибираємо зайві пробіли й відхиляємо поля, заповнені лише пробілами.
        for (const name of fieldNames) {
          const input = form.elements[name];
          input.setCustomValidity('');
          input.value = input.value.trim();
          if (input.required && input.value === '') {
            showError(input, 'Заповніть це поле. Пробіли не є значенням.');
            return;
          }
        }
        if (!form.reportValidity()) return;

        const codeInput = form.elements.code;
        codeInput.value = codeInput.value.toUpperCase();
        const duplicate = Array.from(tbody.rows).some(function (row) {
          return row.cells[0].textContent.toUpperCase() === codeInput.value;
        });
        if (duplicate) {
          showError(codeInput, 'Такий код уже існує в цій таблиці. Вкажіть інший.');
          return;
        }

        if (panelId === 'readers') {
          const registrationYear = Number(form.elements.registered.value.slice(0, 4));
          if (registrationYear < Number(form.elements.birthYear.value)) {
            showError(form.elements.registered, 'Реєстрація не може бути раніше року народження.');
            return;
          }
        }

        if (panelId === 'loans') {
          if (form.elements.due.value < form.elements.issued.value) {
            showError(form.elements.due, 'Термін повернення не може бути раніше дати видачі.');
            return;
          }
          if (form.elements.returned.value && form.elements.returned.value < form.elements.issued.value) {
            showError(form.elements.returned, 'Дата повернення не може бути раніше дати видачі.');
            return;
          }
        }

        // textContent додає введене як текст, а не як HTML-код.
        const row = document.createElement('tr');
        fieldNames.forEach(function (name) {
          const cell = document.createElement('td');
          cell.textContent = form.elements[name].value || 'Ще не повернуто';
          row.appendChild(cell);
        });
        tbody.appendChild(row);
        const addedCode = codeInput.value;
        form.reset();
        updateLoanOptions();
        message.textContent = 'Запис ' + addedCode + ' додано до таблиці.';
        codeInput.focus();
      });
    }

    setupForm(booksForm, 'books', ['code', 'title', 'author', 'genre', 'year', 'pages', 'copies']);
    setupForm(readersForm, 'readers', ['code', 'fullName', 'birthYear', 'email', 'registered', 'category', 'limit']);
    setupForm(loansForm, 'loans', ['code', 'book', 'reader', 'issued', 'due', 'returned', 'condition']);
    updateLoanOptions();
