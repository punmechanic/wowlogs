import { addMilliseconds, parse as parseDateTime } from "date-fns";

export const pulls: Pull[] = [
	{
		id: '1',
		title: 'Pull #1',
		timestamp: new Date(2014, 1, 11),
		result: 'reset'
	},
	{
		id: '2',
		title: 'Pull #2',
		timestamp: new Date(2014, 1, 11),
		result: 'wipe'
	},
	{
		id: '3',
		title: 'Pull #3',
		timestamp: new Date(2014, 1, 11),
		result: 'reset'
	}
];

export interface Pull {
	id: string
	title: string
	timestamp: Date
	result: 'wipe' | 'reset' | 'kill'
}

export interface PointTimeseries {
	datasets: {
		// Name is the name of the data set.
		// This will commonly be the name of a player, or a category.
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

const perPlayerDamageDummyTimeseries = generatePointTimeseries(
	['Arsontime', 'Zarkanis', 'Kevinmaage', 'Arcaik', 'Potatowedges', 'Andorius', 'Joshin', 'Aveshooter', 'Zulenka', 'Nax'],
	100,
	parseDateTime('02/11/2014', 'MM/dd/yyyy', new Date()),
	100
);

const summaryTimeseries = generatePointTimeseries(
	['Damage Done', 'Damage Taken', 'Healing'],
	100,
	parseDateTime('02/11/2014', 'MM/dd/yyyy', new Date()),
	100
);


export async function fetchPerPlayerDamageTimeseries(pullId: string): Promise<PointTimeseries> {
	return perPlayerDamageDummyTimeseries;
}

export async function fetchSummaryTimeseries(pullId: string): Promise<PointTimeseries> {
	return summaryTimeseries;
}
