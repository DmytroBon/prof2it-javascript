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

    // Форми працюють без бібліотек. Дані зберігаються в localStorage.
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
        option.value = readCell(row, 0);
        option.textContent = option.value + ' — ' + readCell(row, 1);
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
          return readCell(row, 0).toUpperCase() === codeInput.value;
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
        prepareRow(row, panelId);
        if (!persistData()) return;
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

    // Коди є сталими ключами. Інші шість полів редагуються по кліку.
    const fieldMap = {
      books: ['code', 'title', 'author', 'genre', 'year', 'pages', 'copies'],
      readers: ['code', 'fullName', 'birthYear', 'email', 'registered', 'category', 'limit'],
      loans: ['code', 'book', 'reader', 'issued', 'due', 'returned', 'condition']
    };

    // Під час редагування повертаємо збережене значення, а не текст елемента вводу.
    function readCell(row, index) {
      return row.cells[index].dataset.value ?? row.cells[index].textContent;
    }

    function validateRow(panelId, values) {
      if (panelId === 'readers' && Number(values[4].slice(0, 4)) < Number(values[2])) {
        return 'Реєстрація не може бути раніше року народження.';
      }
      if (panelId === 'loans') {
        if (!Array.from(document.querySelectorAll('#books tbody tr')).some(function (r) { return readCell(r, 0) === values[1]; }) ||
            !Array.from(document.querySelectorAll('#readers tbody tr')).some(function (r) { return readCell(r, 0) === values[2]; })) {
          return 'Оберіть наявні книгу та читача.';
        }
        if (values[4] < values[3]) return 'Термін повернення не може бути раніше дати видачі.';
        if (values[5] !== 'Ще не повернуто' && values[5] < values[3]) return 'Дата повернення не може бути раніше дати видачі.';
      }
      return '';
    }

    function editCell(cell, row, panelId, index) {
      if (cell.querySelector('input, select')) return;
      const editorVersion = renderVersion;
      const oldValue = readCell(row, index);
      const form = document.getElementById(panelId + '-form');
      const control = form.elements[fieldMap[panelId][index]].cloneNode(true);
      control.removeAttribute('name');
      control.removeAttribute('id');
      control.setAttribute('aria-label', row.closest('table').tHead.rows[0].cells[index].textContent);
      control.value = oldValue === 'Ще не повернуто' ? '' : oldValue;
      cell.dataset.value = oldValue;
      cell.textContent = '';
      cell.appendChild(control);
      control.focus();
      let finished = false;

      function finish(value) {
        if (finished || editorVersion !== renderVersion || !row.isConnected) return;
        finished = true; // Захист від повторного збереження через blur після Enter.
        cell.dataset.value = value;
        cell.textContent = value;
        updateLoanOptions();
        if (value !== oldValue) persistData();
      }

      function save(onBlur) {
        if (finished || editorVersion !== renderVersion || !row.isConnected) return;
        control.setCustomValidity('');
        control.value = control.value.trim();
        const values = fieldMap[panelId].map(function (_, i) { return readCell(row, i); });
        values[index] = control.value || (panelId === 'loans' && index === 5 ? 'Ще не повернуто' : '');
        if (control.required && !control.value) {
          control.setCustomValidity('Значення не може бути порожнім.');
        } else {
          control.setCustomValidity(validateRow(panelId, values));
        }
        if (!control.checkValidity()) {
          const error = control.validationMessage;
          if (onBlur) {
            finish(oldValue);
            alert('Зміни не збережено: ' + error);
          } else {
            control.reportValidity();
          }
          return;
        }
        finish(values[index]);
      }

      control.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          save(false);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          finish(oldValue);
          cell.focus();
        }
      });
      control.addEventListener('input', function () { control.setCustomValidity(''); });
      control.addEventListener('blur', function () { save(true); });
    }

    function deleteRow(row, panelId) {
      const code = readCell(row, 0);
      const referenceColumn = panelId === 'books' ? 1 : 2;
      const isUsed = panelId !== 'loans' && Array.from(document.querySelectorAll('#loans tbody tr')).some(function (loan) {
        return readCell(loan, referenceColumn) === code;
      });
      if (isUsed) {
        alert('Видалення неможливе: запис ' + code + ' використовується в таблиці «Видачі книг». Спочатку видаліть або змініть пов’язані видачі.');
        return;
      }
      row.remove();
      if (!persistData()) return;
      updateLoanOptions();
      document.getElementById(panelId + '-form').querySelector('.message').textContent = 'Запис ' + code + ' видалено.';
    }

    function prepareRow(row, panelId) {
      if (row.cells.length > 7) return;
      for (let index = 1; index < 7; index++) {
        const cell = row.cells[index];
        cell.tabIndex = 0;
        cell.classList.add('editable');
        cell.title = 'Натисніть для редагування';
        cell.addEventListener('click', function () { editCell(cell, row, panelId, index); });
        cell.addEventListener('keydown', function (event) {
          if (event.target === cell && event.key === 'Enter') {
            event.preventDefault();
            editCell(cell, row, panelId, index);
          }
        });
      }
      const actions = row.insertCell();
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = '×';
      removeButton.title = 'Видалити рядок';
      removeButton.setAttribute('aria-label', 'Видалити запис ' + readCell(row, 0));
      removeButton.addEventListener('click', function () { deleteRow(row, panelId); });
      actions.appendChild(removeButton);
    }

    Object.keys(fieldMap).forEach(function (panelId) {
      const table = document.querySelector('#' + panelId + ' table');
      const heading = document.createElement('th');
      heading.scope = 'col';
      heading.textContent = 'Дії';
      table.tHead.rows[0].appendChild(heading);
      Array.from(table.tBodies[0].rows).forEach(function (row) { prepareRow(row, panelId); });
    });

    // Один JSON-документ містить усі три пов'язані таблиці.
    const STORAGE_KEY = 'prof2it-library-homework-04-v1';
    const syncMessage = document.getElementById('sync-status');
    let renderVersion = 0;
    let lastStoredText = null;
    let storageReady = false;
    const initialData = seedData;
    let committedData = initialData;

    function collectData() {
      const data = { version: 1 };
      Object.keys(fieldMap).forEach(function (id) {
        data[id] = Array.from(document.querySelectorAll('#' + id + ' tbody tr')).map(function (row) {
          return fieldMap[id].map(function (_, index) { return readCell(row, index); });
        });
      });
      return data;
    }

    function parseData(text) {
      const data = JSON.parse(text);
      if (!data || data.version !== 1) throw new Error('Невідома версія даних.');
      Object.keys(fieldMap).forEach(function (id) {
        if (!Array.isArray(data[id])) throw new Error('Неправильна структура таблиці.');
        const codes = new Set();
        data[id].forEach(function (row) {
          if (!Array.isArray(row) || row.length !== 7 || row.some(function (v) { return typeof v !== 'string' || !v.trim(); })) {
            throw new Error('Неправильна структура запису.');
          }
          if (codes.has(row[0].toUpperCase())) throw new Error('Повторний код запису.');
          codes.add(row[0].toUpperCase());
        });
      });
      const books = new Set(data.books.map(function (r) { return r[0]; }));
      const readers = new Set(data.readers.map(function (r) { return r[0]; }));
      if (data.loans.some(function (r) { return !books.has(r[1]) || !readers.has(r[2]); })) {
        throw new Error('Порушені зв’язки між таблицями.');
      }
      return data;
    }

    function renderData(data) {
      renderVersion++; // Незавершене редагування старої версії більше не зберігається.
      Object.keys(fieldMap).forEach(function (id) {
        const tbody = document.querySelector('#' + id + ' tbody');
        tbody.replaceChildren();
        data[id].forEach(function (values) {
          const row = document.createElement('tr');
          values.forEach(function (value) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
          });
          tbody.appendChild(row);
          prepareRow(row, id);
        });
        const form = document.getElementById(id + '-form');
        fieldMap[id].forEach(function (name) { form.elements[name].setCustomValidity(''); });
        form.querySelector('.message').textContent = '';
      });
      updateLoanOptions();
    }

    function storageError(error) {
      syncMessage.textContent = 'Помилка збереження: ' + error.message + ' Зміни не збережено. Перевірте доступ до сховища браузера.';
    }

    function loadLatest() {
      try {
        const text = localStorage.getItem(STORAGE_KEY);
        if (storageReady && text === lastStoredText) return;
        // null означає відсутнє сховище, а порожні масиви — збережені порожні таблиці.
        const data = text === null ? initialData : parseData(text);
        committedData = data;
        lastStoredText = text;
        storageReady = true;
        renderData(data);
        syncMessage.textContent = 'Дані відновлено. Зміни з інших вкладок надходять автоматично.';
      } catch (error) {
        storageReady = false;
        storageError(error);
      }
    }

    function persistData() {
      try {
        if (!storageReady) throw new Error('Сховище недоступне або містить пошкоджені дані.');
        // Не перезаписуємо новішу версію, якщо подія storage ще не була оброблена.
        if (localStorage.getItem(STORAGE_KEY) !== lastStoredText) {
          loadLatest();
          syncMessage.textContent = 'Інша вкладка вже змінила дані. Завантажено актуальну версію; повторіть свою дію.';
          return false;
        }
        const data = collectData();
        const text = JSON.stringify(data);
        parseData(text); // Перевірка зв'язків перед записом.
        localStorage.setItem(STORAGE_KEY, text);
        committedData = data;
        lastStoredText = text;
        syncMessage.textContent = 'Усі зміни збережено локально.';
        return true;
      } catch (error) {
        renderData(committedData); // Відкат невдалого збереження.
        storageError(error);
        return false;
      }
    }

    // storage надходить в інші вкладки того самого origin, але не у вкладку-автора.
    window.addEventListener('storage', function (event) {
      if (event.key === STORAGE_KEY || event.key === null) loadLatest();
    });
    window.addEventListener('pageshow', loadLatest);
    window.addEventListener('focus', loadLatest);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) loadLatest();
    });
    loadLatest();
    if (storageReady && lastStoredText === null) persistData();
    if (location.protocol === 'file:') {
      document.getElementById('launch-note').textContent = 'Для синхронізації відкрийте цю сторінку через HTTP/HTTPS (наприклад, локальний сервер). Режим file:// не гарантує спільне сховище між вкладками.';
    }
