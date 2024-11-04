import { Nav, Navbar, NavItem } from "react-bootstrap";
import { LoaderFunctionArgs, NavLink, Outlet, useLoaderData } from "react-router-dom";
import { ChevronRight } from "../../shared/icons";
import cx from 'classnames';
import styles from './Layout.module.css';

interface Params {
	encounterId: number
	pullId: number
}

interface Data {
	encounterName: string
	pullName: string
}

export async function loadData({ params: { encounterId, pullId } }: LoaderFunctionArgs<Params>): Promise<Data> {
	return {
		encounterName: `Encounter #${encounterId}`,
		pullName: `Pull #${pullId}`
	};
}

export default function PullLayout() {
	const { encounterName, pullName } = useLoaderData() as Data;

	return <>
		<Navbar className={styles.TitleBar}>
			<div className={styles.CurrentPage}>
				<span className={styles.EncounterName}>{encounterName}</span>
				<i className={cx(styles.Divider, ChevronRight)} />
				<span className={styles.PullName}>{pullName}</span>
			</div>
		</Navbar>

		<Nav>
			<NavItem>
				<NavLink className='nav-link' to=''>Summary</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='damage' aria-disabled>Damage Done</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='damage_taken' aria-disabled>Damage Taken</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='threat' aria-disabled>Threat</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='buffs' aria-disabled>Buffs</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='debuffs' aria-disabled>Debuffs</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='deaths' aria-disabled>Deaths</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='interrupts' aria-disabled>Interrupts</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='dispels' aria-disabled>Dispels</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='resources' aria-disabled>Resources</NavLink>
			</NavItem>
			<NavItem>
				<NavLink className='nav-link disabled' to='casts' aria-disabled>Casts</NavLink>
			</NavItem>
		</Nav>

		<Outlet />
	</>
}
