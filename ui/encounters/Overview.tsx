import { LoaderFunctionArgs, useLoaderData } from "react-router"
import { NavLink } from "react-router-dom"
import { Pull } from "../api/pulls"
import { Encounter, fetchEncounterInfo } from "../api/encounter"

interface Params {
	encounterId: string
}

interface Data {
	encounter: Encounter
}

export async function loadData({ params: { encounterId } }: LoaderFunctionArgs<Params>): Promise<Data> {
	return {
		encounter: (await fetchEncounterInfo(encounterId!))!
	};
}

interface PullSelectorProps {
	pulls: Pull[]
}

export function PullSelector({ pulls }: PullSelectorProps) {
	return <ol>
		{pulls.map(pull =>
			<li key={pull.id}>
				<NavLink to={`pulls/${pull.id}`}>{pull.title}</NavLink>
			</li>
		)}
	</ol>
}

export default function EncounterOverview() {
	const { encounter } = useLoaderData() as Data;
	const pulls = encounter.pulls.map(pull => {
		return {
			...pull,
			title: `${encounter.title} - ${pull.title}`
		};
	});

	return <>
		<PullSelector pulls={pulls} />
	</>
}

