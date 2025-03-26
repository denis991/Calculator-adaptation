document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('calculator');
	const inputs = form.querySelectorAll('input');
	const formulaElement = document.getElementById('formula');
	const canvas = document.getElementById('graph');
	const ctx = canvas.getContext('2d');
	const resetButton = document.getElementById('reset');

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
			formulaElement.textContent = 'Ошибка: введите корректные значения';
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			return;
		}

		if (vmin >= vmax || fmin >= fmax) {
			formulaElement.textContent = 'Ошибка: минимальные значения должны быть меньше максимальных';
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			return;
		}

		const formula = `calc((100vw - ${vmin}px) / (${vmax} - ${vmin}) * (${fmax} - ${fmin}) + ${fmin}px)`;
		formulaElement.textContent = `Формула: font-size: ${formula}`;
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
		ctx.strokeStyle = '#bdc3c7';
		ctx.moveTo(padding, padding);
		ctx.lineTo(padding, canvas.height - padding);
		ctx.lineTo(canvas.width - padding, canvas.height - padding);
		ctx.stroke();

		// Подписи
		ctx.font = '12px Arial';
		ctx.fillStyle = '#2c3e50';
		ctx.fillText(fmin, padding - 20, canvas.height - padding + 5);
		ctx.fillText(fmax, padding - 20, padding + 15);
		ctx.fillText(vmin, padding - 10, canvas.height - padding + 20);
		ctx.fillText(vmax, canvas.width - padding - 20, canvas.height - padding + 20);

		// График
		ctx.beginPath();
		ctx.strokeStyle = '#3498db';
		ctx.lineWidth = 2;
		for (let x = vmin; x <= vmax; x++) {
			const y = ((x - vmin) / (vmax - vmin)) * (fmax - fmin) + fmin;
			const graphX = padding + (x - vmin) * scaleX;
			const graphY = canvas.height - padding - (y - fmin) * scaleY;
			x === vmin ? ctx.moveTo(graphX, graphY) : ctx.lineTo(graphX, graphY);
		}
		ctx.stroke();
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
});
