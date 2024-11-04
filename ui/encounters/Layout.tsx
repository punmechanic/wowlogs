import { NavLink, Outlet } from "react-router-dom";
import { HouseFill } from "../shared/icons";
import styles from './Layout.module.css';

export default function EncounterLayout() {
	return <>
		<header className={styles.MenuBar}>
			<NavLink to='/' className={HouseFill} title='Home' />
		</header>

		<div>
			<Outlet />
		</div>
	</>;
}
