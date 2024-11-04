import styles from './DamageDone.module.css';
import TimeseriesChart from "../../charts/TimeseriesChart";
import { fetchPerPlayerDamageTimeseries, PointTimeseries } from '../../api/pulls';
import { LoaderFunctionArgs, useLoaderData } from 'react-router';


interface Data {
	timeseries: PointTimeseries
}

export async function loadData({ params: { pullId } }: LoaderFunctionArgs<{ pullId: string }>): Promise<Data> {
	const timeseries = await fetchPerPlayerDamageTimeseries(pullId!);
	return { timeseries }
};

export default function DamageDone() {
	const { timeseries } = useLoaderData() as Data;

	return <>
		<div className={styles.ChartContainer}>
			<TimeseriesChart datasets={timeseries as any} />
		</div>
	</>;
}

