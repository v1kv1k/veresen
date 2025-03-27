document.addEventListener('DOMContentLoaded', () => {
    const calendarDays = document.getElementById('calendar-days');
    const moodDialog = document.getElementById('mood-dialog');
    const moodButtons = document.querySelectorAll('.mood-btn');
    let selectedDay = null;
    let moodData = JSON.parse(localStorage.getItem('moodData')) || {};

    // Добавляем кнопки для сохранения, загрузки и очистки
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
        <button id="save-btn">Сохранить данные</button>
        <button id="load-btn">Загрузить данные</button>
        <button id="clear-btn">Очистить все</button>
    `;
    document.querySelector('.container').insertBefore(controls, document.querySelector('.calendar'));

    // Функция для сохранения данных в файл
    function saveToFile() {
        const dataStr = JSON.stringify(moodData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mood_calendar_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Функция для загрузки данных из файла
    function loadFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    moodData = JSON.parse(e.target.result);
                    localStorage.setItem('moodData', JSON.stringify(moodData));
                    createCalendar(); // Пересоздаем календарь с новыми данными
                } catch (error) {
                    alert('Ошибка при загрузке файла. Убедитесь, что файл содержит корректные данные.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Функция для очистки всех данных
    function clearAllData() {
        if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
            moodData = {};
            localStorage.removeItem('moodData');
            createCalendar(); // Пересоздаем календарь с пустыми данными
        }
    }

    // Добавляем обработчики для кнопок
    document.getElementById('save-btn').addEventListener('click', saveToFile);
    document.getElementById('load-btn').addEventListener('click', loadFromFile);
    document.getElementById('clear-btn').addEventListener('click', clearAllData);

    // Создаем календарь
    function createCalendar() {
        const year = 2024;
        const month = 2; // Март (0-11)
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay() || 7; // Преобразуем воскресенье (0) в 7

        // Очищаем календарь
        calendarDays.innerHTML = '';

        // Добавляем пустые ячейки для начала месяца
        for (let i = 1; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            calendarDays.appendChild(emptyDay);
        }

        // Добавляем дни месяца
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = day;

            // Добавляем случайную фигуру
            const shapes = ['circle', 'square', 'triangle', 'star'];
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            dayElement.classList.add(randomShape);

            // Если есть сохраненное настроение, применяем его
            if (moodData[day]) {
                dayElement.style.backgroundColor = getMoodColor(moodData[day]);
            }

            dayElement.addEventListener('click', () => showMoodDialog(day));
            calendarDays.appendChild(dayElement);
        }
    }

    // Показываем диалог выбора настроения
    function showMoodDialog(day) {
        selectedDay = day;
        moodDialog.style.display = 'flex';
    }

    // Получаем цвет для настроения
    function getMoodColor(mood) {
        const colors = {
            'Счастливый': '#ffeb3b',
            'Грустный': '#9e9e9e',
            'Смайлик': '#ff9800',
            'Вдохновленный': '#9c27b0',
            'Усталый': '#607d8b',
            'Взволнованный': '#f44336'
        };
        return colors[mood] || '#f8f8f8';
    }

    // Обработчики событий для кнопок настроения
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.dataset.mood;
            if (selectedDay) {
                // Сохраняем настроение
                moodData[selectedDay] = mood;
                localStorage.setItem('moodData', JSON.stringify(moodData));

                // Обновляем цвет дня
                const dayElement = calendarDays.children[selectedDay - 1 + (new Date(2024, 2, 1).getDay() || 7) - 1];
                dayElement.style.backgroundColor = getMoodColor(mood);
            }
            moodDialog.style.display = 'none';
        });
    });

    // Закрываем диалог при клике вне его
    moodDialog.addEventListener('click', (e) => {
        if (e.target === moodDialog) {
            moodDialog.style.display = 'none';
        }
    });

    // Создаем календарь при загрузке страницы
    createCalendar();
}); 