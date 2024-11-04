import { Chart, ChartConfiguration, ChartDataset } from "chart.js";
import { useEffect, useRef } from "react";

interface Props {
	datasets: {
		name: string,
		points: ChartDataset[]
	}[]
}

export default function TimeseriesChart({ datasets }: Props) {
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
						data: set.points as any,
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

		const chart = new Chart(chartRef.current, config);
		return () => {
			chart.destroy();
		};
	}, []);

	return <canvas ref={chartRef} />;
}

