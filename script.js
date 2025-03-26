document.addEventListener('DOMContentLoaded', () => {
	// Элементы DOM
	const form = document.getElementById('calculator');
	const inputs = form.querySelectorAll('input');
	const formulaElement = document.getElementById('formula');
	const canvas = document.getElementById('graph');
	const ctx = canvas.getContext('2d');
	const resetButton = document.getElementById('reset');
	const themeToggle = document.getElementById('theme-toggle');
	const languageToggle = document.getElementById('language-toggle');
	const i18nElements = document.querySelectorAll('[data-i18n]');

	// Текущий язык (по умолчанию русский)
	let currentLanguage = 'ru';

	// Переводы
	const translations = {
		ru: {
			title: 'Адаптивный размер шрифта',
			'vmin-label': 'Минимальная ширина экрана (Vmin):',
			'vmax-label': 'Максимальная ширина экрана (Vmax):',
			'fmin-label': 'Минимальный размер шрифта (Fmin):',
			'fmax-label': 'Максимальный размер шрифта (Fmax):',
			calculate: 'Рассчитать',
			reset: 'Сбросить',
			result: 'Результат:',
			'error-values': 'Ошибка: введите корректные значения',
			'error-min-max': 'Ошибка: минимальные значения должны быть меньше максимальных',
		},
		en: {
			title: 'Fluid Font Size Calculator',
			'vmin-label': 'Minimum screen width (Vmin):',
			'vmax-label': 'Maximum screen width (Vmax):',
			'fmin-label': 'Minimum font size (Fmin):',
			'fmax-label': 'Maximum font size (Fmax):',
			calculate: 'Calculate',
			reset: 'Reset',
			result: 'Result:',
			'error-values': 'Error: enter valid values',
			'error-min-max': 'Error: minimum values must be less than maximum values',
		},
	};

	// Функция перевода
	const translatePage = () => {
		i18nElements.forEach((el) => {
			const key = el.getAttribute('data-i18n');
			if (translations[currentLanguage][key]) {
				if (el.tagName === 'INPUT') {
					el.placeholder = translations[currentLanguage][key];
				} else {
					el.textContent = translations[currentLanguage][key];
				}
			}
		});
		updateResult(); // Обновляем результат с новым языком
	};

	// Переключение языка
	// работает всё ок
	languageToggle.addEventListener('click', () => {
		currentLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
		translatePage();
	});

	// Переключение темы
	themeToggle.addEventListener('click', () => {
		document.body.classList.toggle('dark-theme');
		// клас корректно меняется  у body class="light-theme" но нечего больше не происзодит
		document.body.classList.toggle('light-theme');
		updateResult(); // Перерисовываем график с новой темой
	});

	// Загрузка сохраненных значений
	const loadSavedValues = () => {
		const saved = JSON.parse(localStorage.getItem('calculatorValues')) || {};
		document.getElementById('vmin').value = saved.vmin || 480;
		document.getElementById('vmax').value = saved.vmax || 1280;
		document.getElementById('fmin').value = saved.fmin || 16;
		document.getElementById('fmax').value = saved.fmax || 24;
	};

	// Получение значений
	const getValues = () => ({
		vmin: parseFloat(document.getElementById('vmin').value),
		vmax: parseFloat(document.getElementById('vmax').value),
		fmin: parseFloat(document.getElementById('fmin').value),
		fmax: parseFloat(document.getElementById('fmax').value),
	});

	// Обновление результата
	const updateResult = () => {
		const { vmin, vmax, fmin, fmax } = getValues();

		if ([vmin, vmax, fmin, fmax].some(isNaN)) {
			formulaElement.textContent =
				currentLanguage === 'ru'
					? 'Ошибка: введите корректные значения'
					: 'Error: enter valid values';
			formulaElement.classList.add('error');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			return;
		}

		if (vmin >= vmax || fmin >= fmax) {
			formulaElement.textContent =
				currentLanguage === 'ru'
					? 'Ошибка: минимальные значения должны быть меньше максимальных'
					: 'Error: minimum values must be less than maximum values';
			formulaElement.classList.add('error');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			return;
		}

		formulaElement.classList.remove('error');
		const formula = `calc((100vw - ${vmin}px) / (${vmax} - ${vmin}) * (${fmax} - ${fmin}) + ${fmin}px)`;
		formulaElement.textContent =
			currentLanguage === 'ru'
				? `Формула: font-size: ${formula}`
				: `Formula: font-size: ${formula}`;
		localStorage.setItem('calculatorValues', JSON.stringify({ vmin, vmax, fmin, fmax }));
		drawGraph(vmin, vmax, fmin, fmax);
	};

	// Рисование графика
	const drawGraph = (vmin, vmax, fmin, fmax) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const padding = 40;
		const width = canvas.width - 2 * padding;
		const height = canvas.height - 2 * padding;
		const scaleX = width / (vmax - vmin);
		const scaleY = height / (fmax - fmin);

		// Оси
		ctx.beginPath();
		ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border');
		ctx.lineWidth = 1;

		// Y ось
		ctx.moveTo(padding, padding);
		ctx.lineTo(padding, canvas.height - padding);

		// X ось
		ctx.moveTo(padding, canvas.height - padding);
		ctx.lineTo(canvas.width - padding, canvas.height - padding);
		ctx.stroke();

		// Подписи
		ctx.font = '12px Inter';
		ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary');

		// Y подписи
		ctx.textAlign = 'right';
		ctx.fillText(fmin.toFixed(1), padding - 10, canvas.height - padding + 5);
		ctx.fillText(fmax.toFixed(1), padding - 10, padding + 15);

		// X подписи
		ctx.textAlign = 'center';
		ctx.fillText(vmin.toFixed(0), padding, canvas.height - padding + 20);
		ctx.fillText(vmax.toFixed(0), canvas.width - padding, canvas.height - padding + 20);

		// Названия осей
		ctx.textAlign = 'center';
		ctx.font = '14px Inter';
		ctx.fillText(
			currentLanguage === 'ru' ? 'Ширина экрана (px)' : 'Screen width (px)',
			canvas.width / 2,
			canvas.height - 10
		);

		ctx.save();
		ctx.translate(10, canvas.height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.fillText(currentLanguage === 'ru' ? 'Размер шрифта (px)' : 'Font size (px)', 0, 0);
		ctx.restore();

		// График
		// с графиком всё идеально но я думаю его лучше сделать цветным при тёмной теме
		ctx.beginPath();
		ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--primary');
		ctx.lineWidth = 3;

		for (let x = vmin; x <= vmax; x++) {
			const y = ((x - vmin) / (vmax - vmin)) * (fmax - fmin) + fmin;
			const graphX = padding + (x - vmin) * scaleX;
			const graphY = canvas.height - padding - (y - fmin) * scaleY;
			x === vmin ? ctx.moveTo(graphX, graphY) : ctx.lineTo(graphX, graphY);
		}
		ctx.stroke();

		// Точки на графике
		ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary');

		// Начальная точка
		const startX = padding;
		const startY = canvas.height - padding - (fmin - fmin) * scaleY;
		ctx.beginPath();
		ctx.arc(startX, startY, 5, 0, Math.PI * 2);
		ctx.fill();

		// Конечная точка
		const endX = canvas.width - padding;
		const endY = canvas.height - padding - (fmax - fmin) * scaleY;
		ctx.beginPath();
		ctx.arc(endX, endY, 5, 0, Math.PI * 2);
		ctx.fill();
	};

	// Обработчики событий
	inputs.forEach((input) => input.addEventListener('input', updateResult));
	form.addEventListener('submit', (e) => e.preventDefault());
	resetButton.addEventListener('click', () => {
		localStorage.removeItem('calculatorValues');
		loadSavedValues();
		updateResult();
	});

	// Инициализация
	loadSavedValues();
	updateResult();
	translatePage();

	// Адаптивность canvas
	const resizeCanvas = () => {
		const containerWidth = document.querySelector('.container').offsetWidth;
		canvas.width = Math.min(600, containerWidth - 40);
		canvas.height = canvas.width * 0.66;
		updateResult();
	};

	window.addEventListener('resize', resizeCanvas);
	resizeCanvas();
});
