/**
 * Unified data for the ICICLE Services V2 board — the same services listed on
 * the six as-a-Service pages (AIaaS, CIaaS, DOaaS + the three domain
 * catalogs), consolidated so one page can render them densely. Kept in sync
 * with:
 *   pages/DomainAgnosticAI, DomainAgnosticCI, DomainSpecificServices,
 *   pages/DigitalAgAaaS, AnimalEcologyAaaS, FoodLogisticsAaaS
 *
 * `label` is the service text from those pages, kept near-verbatim (light
 * copy-edits only: spelling, and disambiguating rows that shared one label);
 * `description` is a cleaner one-liner shown on hover / when a section
 * expands. `status`:
 *   'live' — routes inside this portal (e.g. /ml-hub)
 *   'ext'  — ready, but off-platform (GitHub / docs), opens in a new tab
 *   'soon' — upcoming, no destination yet
 */
export type ServiceStatus = 'live' | 'ext' | 'soon';

/** picks the icon on expanded-row link buttons */
export type ServiceLinkKind =
  | 'portal'
  | 'docs'
  | 'repo'
  | 'pod'
  | 'pypi'
  | 'npm'
  | 'site';

/** an extra destination for a service, shown when its row is expanded */
export interface ServiceLink {
  label: string;
  /** starts with '/' → portal route (hash link); otherwise absolute URL */
  href: string;
  kind?: ServiceLinkKind;
  /**
   * Icon-font glyph name (the TapisUI sidebar icons, e.g. 'jobs', 'folder',
   * 'data-files') — overrides the kind icon so a destination can carry the
   * exact icon users know from the side pane.
   */
  glyph?: string;
}

export interface ServiceItem {
  /** the capability — verbatim from the source page, the scannable line */
  label: string;
  /** one cleaner sentence shown on hover / when a section expands */
  description: string;
  /** destination display name (omitted for 'soon') */
  name?: string;
  /** route ('live') or URL ('ext') */
  href?: string;
  status: ServiceStatus;
  /** optional contact bubble shown when the row is expanded */
  callout?: { email: string; text: string };
  /**
   * Extra destinations (docs, repos, pods, related portal pages) — the
   * expanded row renders primary + these as a right-aligned button row.
   */
  links?: ServiceLink[];
}

export interface Catalog {
  /** short code used on the sidebar, e.g. 'AIaaS' */
  code: string;
  /** short scannable name, e.g. 'Domain-Agnostic AI' */
  name: string;
  /** the acronym spelled out, e.g. 'ICICLE AI-as-a-Service' */
  expansion: string;
  /** exact original page title (kept verbatim for the mockup) */
  fullTitle: string;
  /** which existing page this mirrors (its route) */
  sourceRoute: string;
  tier: 'agnostic' | 'domain';
  /** the page's original intro text, verbatim */
  intro: string;
  items: ServiceItem[];
}

export const CATALOGS: Catalog[] = [
  {
    code: 'AIaaS',
    name: 'Domain-Agnostic AI',
    expansion: 'ICICLE AI-as-a-Service',
    fullTitle: 'Welcome to the ICICLE-AI-as-a-Service (ICICLE-AIaaS) page!',
    sourceRoute: '/domain-agnostic-ai',
    tier: 'agnostic',
    intro:
      'These services can be used in a domain agnostic manner. Please click on the service link to get more information on how to use this service in a plug-and-play manner.',
    items: [
      {
        label: 'Data Preparation/Cleaning: Out-of-distribution detection (OOD)',
        description:
          'Flags samples that fall outside your training distribution so you can clean or reroute them before they degrade a model.',
        name: 'Forte',
        href: 'https://github.com/ICICLE-ai/forte-api',
        status: 'ext',
      },
      {
        label:
          'Smart Labeling Service for Object Detection : Intelligent AI pipeline for Zero and Few shot object detection',
        description:
          'An AI pipeline that produces object-detection labels from zero or a few examples — bootstrap a labeled set fast.',
        name: 'Smart Labeling Service for Object Detection',
        href: '/smart-labeler',
        status: 'live',
      },
      {
        label:
          'Intelligent Semantic Segmentation & Annotation : Intelligent AI pipeline for Zero and Few shot semantic segmentation',
        description:
          'Pixel-level segmentation and annotation without a hand-labeled corpus, via zero- and few-shot models.',
        name: 'Intelligent Semantic Segmentation & Annotation',
        href: '/smart-segmentation',
        status: 'live',
      },
      {
        label: 'No-Code Workflow Studio',
        description:
          'A no-code workflow studio for building and executing workflows without programming.',
        name: 'No-Code Workflow Studio',
        href: '/no-code-workflow-studio',
        links: [
          {
            label: 'Repo',
            href: 'https://github.com/ICICLE-ai/workflow-orchestrator',
          },
        ],
        status: 'live',
      },
      {
        label:
          'ICICLE Chatbook: A Chatbook built on top of ICICLE CI services to let you chat with your text, PDF, and other data.',
        description:
          'A chatbook built on ICICLE CI services that lets you converse with your documents and datasets.',
        name: 'ICICLE Chatbook',
        href: '/icicle-chatbook',
        status: 'live',
      },
      {
        label: 'Patra Model Cards',
        description:
          'Manage information about AI models, datasets and their active use; also accessible through MLHub.',
        name: 'Patra Model Cards',
        href: 'https://patra.pods.icicleai.tapis.io/',
        status: 'ext',
        links: [
          { label: 'patraserver pod', href: '/pods/patraserver', kind: 'pod' },
          {
            label: 'Repo',
            href: 'https://github.com/Plale-Lab/patra-knowledge-base',
          },
        ],
      },
      {
        label: 'Semi Supervised and Fully Supervised High-Performance Training',
        description:
          'High-performance training pipelines spanning semi-supervised and fully-supervised regimes.',
        status: 'soon',
      },
      {
        label:
          'Flexible Multi-model Server: Unified interface for serving multiple ML models across different inference engines',
        description:
          'One interface for serving many models across different inference engines.',
        name: 'FlexServ',
        href: 'https://zhangwei217245.github.io/FlexServ/',
        status: 'ext',
        links: [
          {
            label: 'Deployer repo',
            href: 'https://github.com/tapis-project/FlexServ-Deployer',
            kind: 'repo',
          },
          {
            label: 'Tutorial',
            href: 'https://tapis-project.github.io/tutorials/Tapis_FlexServ/01b-running-flexserv/',
            kind: 'docs',
          },
          { label: 'AI Hub', href: '/ai-hub', kind: 'portal' },
        ],
      },
      {
        label:
          'Playground for Model Creation, Adaptation, Training, Compression, and Inference',
        description:
          'A playground for the full model lifecycle — creation, adaptation, training, compression, and inference.',
        name: 'MLHub',
        href: '/ml-hub',
        status: 'live',
      },
      {
        label: 'Accelerated Data Annotation',
        description:
          'For an ecologist or animal-sciences researcher creating an annotated/labeled dataset for downstream ecological studies.',
        status: 'soon',
      },
      {
        label: 'Generic Chatbot Creator for Domains',
        description:
          'For a domain researcher creating a domain-specific chatbot for an agronomist, farm service provider, or a farmer.',
        status: 'soon',
      },
      {
        label: 'ICICLE MCP: Allowing other tools to access ICICLE knowledge',
        description:
          'Exposes the ICICLE AI component catalog over MCP so external agents and tools can query it.',
        name: 'ICICLE AI Component MCP',
        href: 'https://github.com/ICICLE-ai/catalog_mcp',
        status: 'ext',
        links: [{ label: 'AI Hub · MCP', href: '/ai-hub', kind: 'portal' }],
      },
      {
        label:
          'Science-driven natural language support for data analysis (Science Agents)',
        description:
          'Science Agents: natural-language support that drives data analysis from a scientific question.',
        status: 'soon',
      },
      {
        label: 'Authentic dataset augmentation for video datasets',
        description:
          'Dataset augmentation techniques tailored to video, preserving authenticity.',
        status: 'soon',
      },
    ],
  },
  {
    code: 'CIaaS',
    name: 'Domain-Agnostic CI',
    expansion: 'ICICLE CI-as-a-Service',
    fullTitle: 'Welcome to the ICICLE-CI-as-a-Service (ICICLE-CIaaS) page!',
    sourceRoute: '/domain-agnostic-ci',
    tier: 'agnostic',
    intro:
      'Many of these services are focused on modern applications targeting the edge-to-cloud/HPC computing continuum. These services can be used in a domain agnostic manner. Please click on the service link to get more information on how to use this service in a plug-and-play manner.',
    items: [
      {
        label: 'Authentication and Orchestration Services',
        description:
          'Identity, authentication, and job/data orchestration underpinning the platform.',
        name: 'TAPIS',
        href: 'https://tapis.readthedocs.io/en/latest/contents.html',
        status: 'ext',
        links: [
          // sidebar glyphs so each destination reads like its side-pane entry
          { label: 'Systems', href: '/systems', glyph: 'data-files' },
          { label: 'Jobs', href: '/jobs', glyph: 'jobs' },
          { label: 'Files', href: '/files', glyph: 'folder' },
          { label: 'Pods', href: '/pods', kind: 'pod' },
          { label: 'tapipy', href: 'https://pypi.org/project/tapipy/' },
          // TypeScript types for every Tapis service
          {
            label: '@tapis/tapis-typescript',
            href: 'https://www.npmjs.com/package/@tapis/tapis-typescript',
          },
        ],
      },
      {
        label: 'Drone Based Data Collection and Transfer',
        description:
          'Collect and move data from drones during field campaigns.',
        name: 'OpenPASS',
        href: '/openpass',
        status: 'live',
      },
      {
        label:
          'Drone Based Data Collection and Transfer for Wildlife & Ecology Field Work',
        description:
          'Drone collection and transfer tuned for wildlife and ecology field work.',
        name: 'WildWing',
        href: 'https://github.com/jennamk14/wildwing-icicle',
        status: 'ext',
      },
      {
        label: 'Camera-Trap Backpacks Linked to Drones & Acoustic Sensors',
        description:
          'Custom camera-trap backpacks linked to drones and/or acoustic sensors.',
        status: 'soon',
      },
      {
        label: 'Data Preprocessing',
        description:
          'Shared preprocessing steps ahead of model training and inference.',
        status: 'soon',
      },
      {
        label:
          'Data Movement, Accelerated Edge to Cloud/HPC and Cloud/HPC to Cloud/HPC Data Movement',
        description:
          'High-throughput data movement across edge, cloud, and HPC — in both directions.',
        name: 'ArrayMorph',
        href: 'https://github.com/ICICLE-ai/ArrayMorph/blob/v0.1.1/README.md',
        status: 'ext',
      },
      {
        label: 'Model Inference to Heatmap Generation and Visualization',
        description:
          'Turn model inference into heatmaps with built-in visualization.',
        status: 'soon',
      },
      {
        label: 'Shapefile Generation and Visualizations',
        description: 'Generate and visualize geospatial shapefiles.',
        status: 'soon',
      },
      {
        label: 'HPC Job Submission Optimizer',
        description:
          'Optimizes how HPC jobs are submitted for better throughput and turnaround.',
        name: 'HARP',
        href: 'https://github.com/ICICLE-ai/harp',
        status: 'ext',
      },
      {
        label: 'ML Field Deployment Planner',
        description:
          'Plans where and how to deploy ML models in the field, at the edge.',
        name: 'ML Edge',
        href: '/ml-edge',
        status: 'live',
      },
      {
        label:
          'Intelligent Edge Management Service : Intelligent Orchestration and Controller Service for deploying and managing AI applications on edge devices.',
        description:
          'Intelligent orchestration and control for deploying and managing AI applications across edge devices.',
        name: 'Intelligent Edge Management Service : Edge Orchestration Platform',
        href: '/intelligent-edge-management-service',
        status: 'live',
      },
      {
        label: 'No-Code Image Lab',
        description:
          'Visualize OpenCV pre-processing operations with no code required.',
        name: 'No-Code Image Lab',
        href: '/no-code-image-lab',
        status: 'live',
      },
    ],
  },
  {
    code: 'DAaaS',
    name: 'Digital Agriculture',
    expansion: 'ICICLE Digital-Agriculture-as-a-Service',
    fullTitle:
      'Welcome to the ICICLE-Digital-Agriculture-as-a-Service (ICICLE-DAaaS) page!',
    sourceRoute: '/digital-ag-aaas',
    tier: 'domain',
    intro:
      'These services provide end-to-end workflows to carry out multiple different tasks in the area of Digital Agriculture. Please click on the service link to get more information on how to use this service in a plug-and-play manner.',
    items: [
      {
        label: 'Harvest',
        description:
          'Harvest workflows for collecting and processing crop and field data.',
        name: 'Harvest',
        href: '/harvest',
        status: 'live',
      },
      {
        label: 'Earth Data Hub',
        description:
          'Harvest workflows for collecting and processing crop and field data.',
        name: 'Earth Data Hub',
        href: '/earth-data-hub',
        links: [
          {
            label: 'Repo',
            href: 'https://github.com/ICICLE-ai/geoharmonizer-ui',
            kind: 'repo',
          },
        ],
        status: 'live',
      },
      {
        label: 'Drone-based Field Analysis',
        description:
          'Analyze fields from drone imagery to inform agronomic decisions.',
        status: 'soon',
      },
      {
        label: 'Drone-based Spot & Variable Rate Spraying',
        description:
          'Targeted, variable-rate spraying planned and executed from drones.',
        status: 'soon',
      },
      {
        label: 'Tractor-based Spot & Variable Rate Spraying',
        description:
          'The same targeted, variable-rate spraying delivered from tractors.',
        status: 'soon',
      },
      {
        label: 'Post-Tillage Soil Aggregate Size Analysis',
        description: 'Measure soil aggregate size distribution after tillage.',
        status: 'soon',
      },
      {
        label: 'Post-Tillage Crop Residue Cover Analysis',
        description: 'Quantify crop residue cover remaining after tillage.',
        status: 'soon',
      },
      {
        label: 'Cultural Practice and Geography Specific Chatbot Creator',
        description:
          'Build chatbots adapted to local cultural practice and geography.',
        status: 'soon',
      },
    ],
  },
  {
    code: 'AEaaS',
    name: 'Animal Ecology',
    expansion: 'ICICLE Animal-Ecology-as-a-Service',
    fullTitle:
      'Welcome to the ICICLE-Animal-Ecology-as-a-Service (ICICLE-AEaaS) page!',
    sourceRoute: '/animal-ecology-aaas',
    tier: 'domain',
    intro:
      'These services provide end-to-end workflows to carry out multiple different tasks in the area of Animal Ecology. Please click on the service link to get more information on how to use this service in a plug-and-play manner.',
    items: [
      {
        label:
          'I-SAW Portal: Sensing and Analytics on Wildlife — plug-and-play field kits (camera-trap backpacks, drones) with live device monitoring',
        description:
          'Deploy and monitor I-SAW wildlife field kits — camera-trap backpacks and drones — from one plug-and-play control center.',
        name: 'I-SAW Portal',
        href: '/isaw-portal',
        status: 'live',
      },
      {
        label:
          'Design custom camera-trap hardware & software (ML-driven Planner for Ecologists)',
        description:
          'Design custom camera-trap hardware and software with an ML-driven planner built for ecologists.',
        status: 'soon',
      },
      {
        label:
          'Conduct Multi-modal Wildlife Monitoring using Commodity Devices',
        description:
          'Conduct multi-modal wildlife monitoring using commodity hardware.',
        status: 'soon',
      },
      {
        label: 'Citizen Science Applications with Custom Camera-Trap Backpacks',
        description:
          'Citizen-science applications powered by custom camera-trap backpacks.',
        status: 'soon',
      },
    ],
  },
  {
    code: 'FLSaaS',
    name: 'Food Logistics & Security',
    expansion: 'ICICLE Food-Logistics-and-Security-as-a-Service',
    fullTitle:
      'Welcome to the ICICLE-Food-Logistics-and-Security-as-a-Service (ICICLE-FLaaS) page!',
    sourceRoute: '/food-logistics-aaas',
    tier: 'domain',
    intro:
      'These services provide end-to-end workflows to carry out multiple different tasks in the area of Food Logistics and Security. Please click on the service link to get more information on how to use this service in a plug-and-play manner.',
    items: [
      {
        label:
          'Graph Neural Networks (GNN)-based prediction of U.S. food trade flows',
        description:
          'Graph neural networks that predict food trade flows across the United States.',
        name: 'Food Flow Portal',
        href: '/food-flow-portal',
        status: 'live',
      },
      {
        label: 'FEAST',
        description: 'The FEAST toolkit for food access and security analysis.',
        name: 'FEAST',
        href: '/feast',
        status: 'live',
      },
      {
        label: 'Agriculture Routing',
        description: 'Generate routing data for agricultural logistics.',
        name: 'Agriculture Routing',
        href: 'https://github.com/ICICLE-ai/ag_routing_data_generator',
        status: 'ext',
      },
      {
        label: 'Sandbox',
        description:
          'A sandbox environment to prototype and run food-security analyses.',
        name: 'Food Security Sandbox',
        href: '/food-security-sandbox',
        status: 'live',
        // callout removed until there is a real contact address — the previous
        // yy@icicle.com was a placeholder; re-add via `callout` when known.
      },
    ],
  },
];

/** DOaaS is the umbrella over the three domain catalogs (not its own list). */
export const DOAAS = {
  code: 'DOaaS',
  expansion: 'ICICLE Domain-as-a-Service',
  fullTitle: 'Domain-as-a-Service',
  sourceRoute: '/domain-specific-services',
  intro:
    'Explore ICICLE services tailored to specific research and science domains.',
};

export const statusCounts = (items: ServiceItem[]) => ({
  live: items.filter((i) => i.status === 'live').length,
  ext: items.filter((i) => i.status === 'ext').length,
  soon: items.filter((i) => i.status === 'soon').length,
});
