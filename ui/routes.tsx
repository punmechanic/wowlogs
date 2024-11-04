import { loadData, Root } from './Root';
import * as EncounterOverview from "./encounters/Overview";
import * as PullSummary from "./encounters/pulls/Summary";
import * as PullLayout from './encounters/pulls/Layout';
import * as PullDamageDone from './encounters/pulls/DamageDone';

export default [
	{
		element: <Root />,
		loader: loadData,
		index: true,
	},
	{
		path: 'encounters/*',
		children: [
			{
				path: ':encounterId',
				loader: EncounterOverview.loadData,
				element: <EncounterOverview.default />,
			},
			{
				path: ":encounterId/pulls/:pullId",
				element: <PullLayout.default />,
				loader: PullLayout.loadData,
				children: [
					{
						index: true,
						loader: PullSummary.loadData,
						element: <PullSummary.default />,
					},
					{
						path: 'damage-done',
						loader: PullDamageDone.loadData,
						element: <PullDamageDone.default />,
					}
				]
			}
		]
	}
];
