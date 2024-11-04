import { Pull, pulls } from './pulls';

const encounters: Encounter[] = [
	{ id: '1', title: "Encounter 1", pulls },
	{ id: '2', title: "Encounter 2", pulls },
	{ id: '3', title: "Encounter 3", pulls },
	{ id: '4', title: "Encounter 4", pulls }
]

export interface Encounter {
	id: string
	title: string
	pulls: Pull[]
}

export async function fetchEncounterInfo(encounterId: string): Promise<Encounter | null> {
	return encounters.find(x => x.id === encounterId) ?? null;
}

export async function listAllEncounters(): Promise<Encounter[]> {
	return encounters;
}
