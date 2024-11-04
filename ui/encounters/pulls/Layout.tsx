import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, Navbar, NavItem } from "react-bootstrap";
import { LoaderFunctionArgs, NavLink, Outlet, useLoaderData } from "react-router-dom";
import { HouseFill } from "../../shared/icons";
import { Pull } from "../../api/pulls";
import cx from 'classnames';
import styles from './Layout.module.css';
import { fetchEncounterInfo } from "../../api/encounter";

interface Params {
	encounterId: string
	pullId: string
}

interface Data {
	pullName: string
	pulls: Pull[]
}

export async function loadData({ params: { encounterId, pullId } }: LoaderFunctionArgs<Params>): Promise<Data> {
	const encounter = (await fetchEncounterInfo(encounterId!))!;
	const pulls = encounter.pulls.map(pull => {
		return {
			...pull,
			title: `${encounter.title} - ${pull.title}`
		};
	});
	const pullInfo = pulls.find(x => x.id === pullId);
	return {
		pullName: pullInfo?.title!,
		pulls
	};
}

function PullHeader() {
	const { pullName, pulls } = useLoaderData() as Data;
	return <Navbar className={styles.TitleBar}>
		<Dropdown className={styles.PullDropdownButton}>
			<DropdownToggle title={pullName}>{pullName}</DropdownToggle>
			<DropdownMenu as='ol'>
				{pulls.map(pull => (
					<li key={pull.id}>
						<DropdownItem key={pull.id}>
							<NavLink relative="path" to={`../${pull.id}`}>{pull.title}</NavLink>
						</DropdownItem>
					</li>
				))}
			</DropdownMenu>
		</Dropdown>

		<NavLink className={cx(styles.HomeButton, HouseFill)} to='/'>Home</NavLink>
	</Navbar >
}

export default function PullLayout() {
	return <>
		<PullHeader />
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
