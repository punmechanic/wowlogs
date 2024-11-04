import { useEffect } from "react"
import { NavLink, Outlet, useLoaderData } from "react-router-dom"

interface RootData {
	encounters: Encounter[]
}

export async function loadData(): Promise<RootData> {
	return {
		encounters: [
			{ id: '1', title: "Encounter 1" },
			{ id: '2', title: "Encounter 2" },
			{ id: '3', title: "Encounter 3" },
			{ id: '4', title: "Encounter 4" }
		]
	}
}

interface Encounter {
	id: string
	title: string
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
