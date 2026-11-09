import { lazy } from 'react';

// All extensions load at boot, so an eager import here would put these pages in
// the entry bundle of every tenant. Importing each page's own module keeps it in
// a separate chunk until its route opens.
export const DataLabeler = lazy(() => import('./DataLabeler/DataLabeler'));
export const JupyterLab = lazy(() => import('./JupyterLab/JupyterLab'));
export const OpenWebUI = lazy(() => import('./OpenWebUI/OpenWebUI'));
export const MLEdge = lazy(() => import('./MLEdge/_Layout'));
export const DigitalAgOpenPASS = lazy(
  () => import('./DigitalAgOpenPASS/DigitalAgOpenPASS')
);
export const SmartScheduler = lazy(
  () => import('./SmartScheduler/SmartScheduler')
);
//export const VisualAnalytics = lazy(() => import('./VisualAnalytics/VisualAnalytics'));
export const TrainingCatalog = lazy(
  () => import('./TrainingCatalog/TrainingCatalog')
);
export const CKNDashboard = lazy(() => import('./CKNDashboard/CKNDashboard'));
export const CatalogAnalytics = lazy(
  () => import('./CatalogAnalytics/CatalogAnalytics')
);
export const ComponentCatalog = lazy(
  () => import('./ComponentCatalog/ComponentCatalog')
);
export const Harvest = lazy(() => import('./Harvest/Harvest'));
export const FoodFlowPortal = lazy(
  () => import('./FoodFlowPortal/FoodFlowPortal')
);
export const FEAST = lazy(() => import('./FEAST/FEAST'));
export const FoodSecuritySandbox = lazy(
  () => import('./FoodSecuritySandbox/FoodSecuritySandbox')
);
export const PortalHome = lazy(() => import('./PortalHome/PortalHome'));
export const DomainAgnosticAI = lazy(
  () => import('./DomainAgnosticAI/DomainAgnosticAI')
);
export const ICICLEChatbook = lazy(
  () => import('./ICICLEChatbook/ICICLEChatbook')
);
export const DomainAgnosticCI = lazy(
  () => import('./DomainAgnosticCI/DomainAgnosticCI')
);
export const DomainSpecificServices = lazy(
  () => import('./DomainSpecificServices/DomainSpecificServices')
);
export const DigitalAgAaaS = lazy(
  () => import('./DigitalAgAaaS/DigitalAgAaaS')
);
export const AnimalEcologyAaaS = lazy(
  () => import('./AnimalEcologyAaaS/AnimalEcologyAaaS')
);
export const FoodLogisticsAaaS = lazy(
  () => import('./FoodLogisticsAaaS/FoodLogisticsAaaS')
);
export const IcicleServicesV2 = lazy(
  () => import('./IcicleServicesV2/IcicleServicesV2')
);
export const Patra = lazy(() => import('./Patra/Patra'));
export const IntelligentEdgeManagementService = lazy(
  () =>
    import(
      './IntelligentEdgeManagementService/IntelligentEdgeManagementService'
    )
);
export const HARP = lazy(() => import('./HARP/HARP'));
export const ISAWPortal = lazy(() => import('./ISAWPortal/ISAWPortal'));
export const Insights = lazy(() => import('./Insights/Insights'));
export const AutoOptTabular = lazy(
  () => import('./AutoOptTabular/AutoOptTabular')
);
export const FNAS_LCD = lazy(() => import('./FNAS_LCD/FNAS_LCD'));
export const ScienceAgents = lazy(
  () => import('./ScienceAgents/ScienceAgents')
);
export const SmartDetection = lazy(
  () => import('./SmartDetection/SmartDetection')
);
export const SmartSegmentation = lazy(
  () => import('./SmartSegmentation/SmartSegmentation')
);
export const NoCodeImageLab = lazy(
  () => import('./NoCodeImageLab/NoCodeImageLab')
);
export const WorkflowStudio = lazy(
  () => import('./WorkflowStudio/WorkflowStudio')
);
export const EarthDataHub = lazy(() => import('./EarthDataHub/EarthDataHub'));
export const VideoSegmentationTracking = lazy(
  () => import('./VideoSegmentationTracking/VideoSegmentationTracking')
);
