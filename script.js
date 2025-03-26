document.addEventListener('DOMContentLoaded', function () {
	// Загружаем сохраненные значения из localStorage
	const savedValues = JSON.parse(localStorage.getItem('calculatorValues')) || {};
	document.getElementById('vmin').value = savedValues.vmin || 480;
	document.getElementById('vmax').value = savedValues.vmax || 1280;
	document.getElementById('fmin').value = savedValues.fmin || 16;
	document.getElementById('fmax').value = savedValues.fmax || 24;

	// Обработчик отправки формы
	document.getElementById('calculator').addEventListener('submit', function (e) {
		e.preventDefault();

		// Получаем значения из формы
		const vmin = parseFloat(document.getElementById('vmin').value);
		const vmax = parseFloat(document.getElementById('vmax').value);
		const fmin = parseFloat(document.getElementById('fmin').value);
		const fmax = parseFloat(document.getElementById('fmax').value);

		// Сохраняем значения в localStorage
		localStorage.setItem('calculatorValues', JSON.stringify({ vmin, vmax, fmin, fmax }));

		// Рассчитываем формулу
		const formula = `calc( (100vw - ${vmin}px) / (${vmax} - ${vmin}) * (${fmax} - ${fmin}) + ${fmin}px )`;
		document.getElementById('formula').textContent = `Формула: font-size: ${formula};`;

		// Рисуем график
		drawGraph(vmin, vmax, fmin, fmax);
	});
});

function drawGraph(vmin, vmax, fmin, fmax) {
	const canvas = document.getElementById('graph');
	const ctx = canvas.getContext('2d');

	// Очистка холста
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Настройки графика
	const padding = 40;
	const width = canvas.width - 2 * padding;
	const height = canvas.height - 2 * padding;

	// Масштабирование осей
	const scaleX = width / (vmax - vmin);
	const scaleY = height / (fmax - fmin);

	// Оси координат
	ctx.beginPath();
	ctx.strokeStyle = '#ccc';
	ctx.moveTo(padding, padding);
	ctx.lineTo(padding, canvas.height - padding); // Вертикальная ось
	ctx.lineTo(canvas.width - padding, canvas.height - padding); // Горизонтальная ось
	ctx.stroke();

	// Подписи осей
	ctx.font = '12px Arial';
	ctx.fillStyle = '#333';
	ctx.fillText(fmin, padding - 20, canvas.height - padding);
	ctx.fillText(fmax, padding - 20, padding + 10);
	ctx.fillText(vmin, padding, canvas.height - padding + 20);
	ctx.fillText(vmax, canvas.width - padding - 20, canvas.height - padding + 20);

	// Линия графика
	ctx.beginPath();
	ctx.strokeStyle = '#007bff';
	ctx.lineWidth = 2;

	for (let x = vmin; x <= vmax; x++) {
		const y = ((x - vmin) / (vmax - vmin)) * (fmax - fmin) + fmin;
		const graphX = padding + (x - vmin) * scaleX;
		const graphY = canvas.height - padding - (y - fmin) * scaleY;
		if (x === vmin) ctx.moveTo(graphX, graphY);
		else ctx.lineTo(graphX, graphY);
	}

	ctx.stroke();
}
document.getElementById('reset').addEventListener('click', function () {
	localStorage.removeItem('calculatorValues');
	location.reload(); // Перезагружаем страницу для очистки полей
});
