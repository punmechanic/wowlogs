import { Chart } from "chart.js/auto";
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';

export function installPlugins() {
	Chart.register(zoomPlugin);
}
