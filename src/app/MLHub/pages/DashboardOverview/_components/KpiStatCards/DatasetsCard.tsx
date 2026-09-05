import DatasetIcon from '@mui/icons-material/Dataset';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import KpiCard from './KpiCard';

export default function DatasetsCard() {
  const { data, isLoading, error } = Hooks.Datasets.useListAllOwnedDatasets();

  return (
    <KpiCard
      title="Datasets"
      value={data?.length ?? 0}
      icon={<DatasetIcon />}
      color="secondary"
      trend=""
      trendUp={false}
      subtitle="Registered datasets"
      navigateTo="/datasets"
      loading={isLoading}
      error={error}
    />
  );
}
