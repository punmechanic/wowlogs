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

export async function getPullsForEncounter(encounterId: string): Promise<Pull[]> {
	return pulls;
}
