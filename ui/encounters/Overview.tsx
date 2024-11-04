import { LoaderFunctionArgs, useLoaderData } from "react-router"
import { NavLink } from "react-router-dom"
import { getPullsForEncounter, Pull } from "../api/pulls"

interface Params {
	encounterId: string
}

interface Data {
	pulls: Pull[]
}

export async function loadData({ params: { encounterId } }: LoaderFunctionArgs<Params>): Promise<Data> {
	return {
		pulls: await getPullsForEncounter(encounterId!)
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
	const { pulls } = useLoaderData() as Data;

	return <>
		<PullSelector pulls={pulls} />
	</>
}

