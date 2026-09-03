import { Grid } from '@mui/material';
import TotalModelsCard from './TotalModelsCard';
import DatasetsCard from './DatasetsCard';
import ActiveDeploymentsCard from './ActiveDeploymentsCard';
import ArtifactsCard from './ArtifactsCard';
import ModelsMarketplaceCard from './ModelsMarketplaceCard';
import DatasetsMarketplaceCard from './DatasetsMarketplaceCard';

export default function KpiStatCards() {
  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <TotalModelsCard />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <DatasetsCard />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <ActiveDeploymentsCard />
      </Grid>

      {/* <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <ArtifactsCard />
      </Grid> */}

      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <ModelsMarketplaceCard />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <DatasetsMarketplaceCard />
      </Grid>
    </Grid>
  );
}
