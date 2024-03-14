//import { Pods } from '@tapis/tapis-typescript';

export const tapisPod = {
  pod_id: 'testpod2',
  pod_template: 'template/postgres',
  description: 'Test pod fixture for testing',
  command: undefined,
  environment_variables: {},
  data_requests: [],
  roles_required: [],
  status_requested: 'ON',
  volume_mounts: {
    test4: {
      type: 'tapisvolume',
      mount_path: '/var/lib/postgresql/data',
      sub_path: '',
    },
  },
  time_to_stop_default: -1,
  time_to_stop_instance: undefined,
  networking: {
    default: {
      protocol: 'postgres',
      port: 5432,
      url: 'test4.pods.tacc.develop.tapis.io',
    },
  },
  resources: {
    cpu_request: 250,
    cpu_limit: 2000,
    mem_request: 256,
    mem_limit: 3072,
    gpus: 0,
  },
  time_to_stop_ts: null,
  status: 'AVAILABLE',
  status_container: {
    phase: 'Running',
    start_time: '2024-02-13T20:58:32.000000',
    message: 'Pod is running.',
  },
  data_attached: [],
  roles_inherited: [],
  creation_ts: '2024-02-13T20:58:31.358557',
  update_ts: '2024-02-13T20:58:31.358649',
  start_instance_ts: '2024-02-13T20:59:08.175504',
  action_logs: [
    "24/02/13 20:58: Pod object created by 'cgarcia'",
    '24/02/13 20:58: spawner set status to CREATING',
    '24/02/13 20:59: health set status to AVAILABLE',
  ],
};
