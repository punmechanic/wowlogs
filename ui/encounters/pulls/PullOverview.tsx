import { Chart, ChartConfiguration, ChartData } from "chart.js/auto";
import { addSeconds, getMilliseconds } from "date-fns";
import { useEffect, useMemo, useRef } from "react";
import 'chartjs-adapter-date-fns';

export async function loadData() {
	return null;
}

interface Timeseries {
	name: string
	// HACK: any is used to prevent TypeScript from complaining about us using Date, which is a valid option for time series axes.
	points: { x: any, y: number }[]
}


function generateDummySeries(): Timeseries[] {
	const date = new Date();
	const offsetSeconds = 5;
	const sets = ['Warrior', 'Mage'];
	const numPoints = 100;

	return sets.map(name => {
		const points = [];
		for (let i = 0; i < numPoints; i++) {
			points.push({
				y: Math.random() * 200,
				x: addSeconds(date, i * offsetSeconds)
			});
		}
		return {
			name,
			points
		};
	});
}

function DamageChart() {
	const data = useMemo(() => {
		const data = generateDummySeries();
		const datasets = data.map(set => {
			return {
				label: set.name,
				data: set.points,
				fill: false,
				cubicInterpolationMode: 'monotone' as const
			}
		});

		// TODO: Add an All series which is the cumulative sum of all entries.
		return { datasets }
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
						time: {
							unit: 'second'
						}
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

