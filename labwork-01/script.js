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
