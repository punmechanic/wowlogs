import { loadData, Root } from './Root';
import * as EncounterOverview from "./encounters/EncounterOverview";
import * as PullOverview from "./encounters/pulls/PullOverview";

export default [
	{
		path: '/',
		element: <Root />,
		loader: loadData,
		children: [
			{
				path: 'encounters/*',
				children: [
					{
						path: ':id',
						loader: EncounterOverview.loadData,
						element: <EncounterOverview.default />,
					},
					{
						path: ":id/pulls/:number",
						loader: PullOverview.loadData,
						element: <PullOverview.default />,
					}
				]
			}
		],
	},
];
