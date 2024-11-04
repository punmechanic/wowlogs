import { Pull, pulls } from './pulls';

const encounters: Encounter[] = [
	{ id: '1', title: "Ulgrax the Devourer Mythic", pulls },
	{ id: '2', title: "Sikran, Captain of the Sureki Mythic", pulls },
	{ id: '3', title: "Mists of Tirna Scithe", pulls },
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
