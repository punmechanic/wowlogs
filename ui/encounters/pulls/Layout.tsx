import { Nav, NavItem } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";

export default function PullLayout() {
	return <>
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
