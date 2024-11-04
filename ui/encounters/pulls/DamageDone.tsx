import { Chart, ChartConfiguration } from "chart.js/auto";
import { addMilliseconds, parse } from "date-fns";
import { useEffect, useRef, useState } from "react";
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import styles from './DamageDone.module.css';

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
	['Arsontime', 'Zarkanis', 'Kevinmaage', 'Arcaik', 'Potatowedges', 'Andorius', 'Joshin', 'Aveshooter', 'Zulenka', 'Nax'],
	100,
	parse('02/11/2014', 'MM/dd/yyyy', new Date()),
	100
);

export async function loadData() {
	return null;
}

function DamageChart() {
	const { datasets } = damageTimeseries;
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<Chart>();
	const [zoomed, setZoomed] = useState(false);

	const resetZoom = () => {
		chartRef.current?.resetZoom();
		setZoomed(false);
	};

	useEffect(() => {
		if (canvasRef.current == null) {
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
				maintainAspectRatio: true,
				aspectRatio: 3,
				events: ['mousedown', 'mouseup', 'mousemove'],
				plugins: {
					zoom: {
						zoom: {
							onZoom(_ctx) {
								setZoomed(true)
							},
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
							unit: 'second',
							minUnit: "second"
						}
					},
					y: {
						display: true,
						title: {
							display: true,
							text: 'Per Second Amounts'
						},
						suggestedMin: 0
					}
				}
			},
		};

		const chart = new Chart(canvasRef.current, config);
		chartRef.current = chart;
		return () => {
			chart.destroy();
			chartRef.current = undefined;
		};
	}, []);
	return <>
		<canvas ref={canvasRef} />
		{zoomed && <button onClick={resetZoom}>Reset Zoom</button>}
	</>
}


export default function DamageDone() {
	return <>
		<div className={styles.ChartContainer}>
			<DamageChart />

		</div>
	</>;
}

