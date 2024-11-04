import { useLoaderData } from "react-router"
import { NavLink } from "react-router-dom"

interface Pull {
	id: string
	title: string
	timestamp: Date
	result: 'wipe' | 'reset' | 'kill'
}

interface Data {
	pulls: Pull[]
}

export async function loadData(): Promise<Data> {
	return {
		pulls: [
			{
				id: '1',
				title: 'Pull #1',
				timestamp: new Date(2014, 1, 11),
				result: 'reset'
			}
		]
	}
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

