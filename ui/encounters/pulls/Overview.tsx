import { Chart, ChartConfiguration } from "chart.js/auto";
import { addMilliseconds, parse } from "date-fns";
import { useEffect, useRef } from "react";
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Nav, NavItem } from "react-bootstrap";
import { NavLink } from "react-router-dom";

Chart.register(zoomPlugin);

interface PointTimeseries {
	datasets: {
		name: string
		points: {
			// X is the timestamp of the event.
			x: Date,
			// Y is the value of the event.
			y: number
		}[]
	}[]
}

function generatePointTimeseries(labels: string[], pointsPerSet: number, startTime: Date, offsetMillis: number): PointTimeseries {
	const sets = labels.map(name => {
		const points = [];
		for (let i = 0; i < pointsPerSet; i++) {
			points.push({
				y: Math.random() * 200,
				x: addMilliseconds(startTime, i * offsetMillis)
			});
		}

		return {
			name,
			points
		};
	});

	return {
		datasets: sets
	};
}

// TODO: Add an All series which is the cumulative sum of all entries.
// TODO: Aggregate data for a value that makes sense based on the current resolution of the time axis.
// For example,  if the resolution of the time axis is 1 minute, it might not make sense to show every single data point at 500ms.
const damageTimeseries = generatePointTimeseries(
	['Warrior', 'Mage', 'Paladin'],
	100,
	parse('02/11/2014', 'MM/dd/yyyy', new Date()),
	100
);

export async function loadData() {
	return null;
}

function DamageChart() {
	const { datasets } = damageTimeseries;
	const chartRef = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (chartRef.current == null) {
			return;
		}

		const config: ChartConfiguration = {
			type: 'line',
			data: {
				datasets: datasets.map(set => {
					return {
						label: set.name,
						data: set.points as any, // Cast to any lets us provide Date directly to ChartJS
						fill: false,
						cubicInterpolationMode: 'monotone' as const,
						pointRadius: 0,
					}
				})
			},
			options: {
				animation: false,
				responsive: true,
				events: ['mousedown', 'mouseup', 'mousemove'],
				plugins: {
					title: {
						display: true,
						text: 'Damage Chart'
					},
					zoom: {
						zoom: {
							wheel: {
								enabled: true,
							},
							drag: {
								enabled: true
							},
							mode: 'x'
						}
					}
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
	}, []);
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

