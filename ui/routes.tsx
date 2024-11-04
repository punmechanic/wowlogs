import { loadData, Root } from './Root';
import * as EncounterOverview from "./encounters/Overview";
import EncounterLayout from "./encounters/Layout";
import * as PullOverview from "./encounters/pulls/Overview";

export default [
	{
		path: '/',
		element: <Root />,
		loader: loadData,
		index: true,
	},
	{
		path: 'encounters/*',
		element: <EncounterLayout />,
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
];
