import { Chart, ChartConfiguration } from "chart.js/auto";
import { useEffect, useMemo, useRef } from "react";

export async function loadData() {
	return null;
}

function DamageChart() {
	const data = useMemo(() => {
		const DATA_COUNT = 12;
		const labels = [];
		for (let i = 0; i < DATA_COUNT; ++i) {
			labels.push(i.toString());
		}
		const datapoints = [0, 20, 20, 60, 60, 120, NaN, 180, 120, 125, 105, 110, 170];
		return {
			labels: labels,
			datasets: [
				{
					label: 'Cubic interpolation (monotone)',
					data: datapoints,
					// borderColor: Utils.CHART_COLORS.red,
					fill: false,
					cubicInterpolationMode: 'monotone',
					tension: 0.4
				}, {
					label: 'Cubic interpolation',
					data: datapoints,
					// borderColor: Utils.CHART_COLORS.blue,
					fill: false,
					tension: 0.4
				}, {
					label: 'Linear interpolation (default)',
					data: datapoints,
					// borderColor: Utils.CHART_COLORS.green,
					fill: false
				}
			]
		};
	}, []);

	const chartRef = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (chartRef.current == null) {
			return;
		}

		const config: ChartConfiguration = {
			type: 'line',
			data: data,
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Chart.js Line Chart - Cubic interpolation mode'
					},
				},
				interaction: {
					intersect: false,
				},
				scales: {
					x: {
						display: true,
						title: {
							display: true
						}
					},
					y: {
						display: true,
						title: {
							display: true,
							text: 'Value'
						},
						suggestedMin: -10,
						suggestedMax: 200
					}
				}
			},
		};

		const chart = new Chart(chartRef.current, config);
		return () => {
			chart.destroy();
		};
	}, [data]);
	return <canvas ref={chartRef} />;
}


export default function PullOverview() {
	return <>
		<h1>Damage Chart</h1>
		<DamageChart />
	</>;
}

