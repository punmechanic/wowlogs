import { Chart, ChartConfiguration, ChartData } from "chart.js/auto";
import { addSeconds } from "date-fns";
import { useEffect, useMemo, useRef } from "react";
import 'chartjs-adapter-date-fns';

export async function loadData() {
	return null;
}


function DamageChart() {
	const data: ChartData = useMemo(() => {
		const DATA_COUNT = 12;
		// const labels = [];

		// This is dummy data.
		const date = new Date();
		// for (let i = 0; i < DATA_COUNT; ++i) {
		// 	labels.push(i.toString());
		// }

		const offsetSeconds = 5;
		const data = [0, 20, 20, 60, 60, 120, NaN, 180, 120, 125, 105, 110, 170];
		const points = data.map((val, index) => {
			return {
				y: val,
				x: addSeconds(date, index * offsetSeconds)
			}
		});

		return {
			labels: [],
			datasets: [
				{
					label: 'Damage',
					data: points,
					fill: false,
					cubicInterpolationMode: 'monotone',
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
			data,
			options: {
				animation: false,
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Damage Chart'
					},
				},
				interaction: {
					intersect: false,
				},
				scales: {
					x: {
						display: true,
						type: 'timeseries',
					},
					y: {
						display: true,
						title: {
							display: true,
							text: 'Value'
						},
						suggestedMin: 0
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
		<div style={{ maxWidth: 1000, maxHeight: 800 }}>
			<DamageChart />
		</div>
	</>;
}

