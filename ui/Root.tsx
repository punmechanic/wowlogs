import { NavLink, Outlet, useLoaderData } from "react-router-dom"
import { Encounter, listAllEncounters } from "./api/encounter"

interface RootData {
	encounters: Encounter[]
}

export async function loadData(): Promise<RootData> {
	return {
		encounters: await listAllEncounters()
	};
}

export function Root() {
	const { encounters } = useLoaderData() as RootData;
	return <>
		<ol>
			{encounters.map(encounter => (
				<li><NavLink key={encounter.id} to={`/encounters/${encounter.id}`}>{encounter.title}</NavLink></li>
			))}
		</ol>

		<Outlet />
	</>;
}
