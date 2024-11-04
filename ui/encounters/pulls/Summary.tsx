import styles from './Summary.module.css';
import TimeseriesChart from "../../charts/TimeseriesChart";
import { LoaderFunctionArgs, useLoaderData } from "react-router";
import { fetchSummaryTimeseries, PointTimeseries } from "../../api/pulls";


interface Data {
	timeseries: PointTimeseries
}

export async function loadData({ params: { pullId } }: LoaderFunctionArgs<{ pullId: string }>): Promise<Data> {
	const timeseries = await fetchSummaryTimeseries(pullId!);
	return { timeseries }
};


export default function PullSummary() {
	const { timeseries } = useLoaderData() as Data;

	return <>
		<div className={styles.ChartContainer}>
			<TimeseriesChart datasets={timeseries as any} />
		</div>
	</>;
}
