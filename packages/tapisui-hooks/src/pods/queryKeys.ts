const QueryKeys = {
  // Pods
  getPod: 'pods/getPod',
  createPod: 'pods/createPod',
  updatePod: 'pods/updatePod',
  deletePod: 'pods/deletePod',
  startPod: 'pods/startPod',
  stopPod: 'pods/stopPod',
  restartPod: 'pods/restartPod',
  getPodLogs: 'pods/getPodLogs',
  getPodPermissions: 'pods/getPodPermissions',
  setPodPermission: 'pods/setPodPermission',
  getPodSecrets: 'pods/getPodSecrets',
  deletePodPermission: 'pods/deletePodPermission',
  listPods: 'pods/listPods',

  // Templates
  getTemplate: 'pods/getTemplate',
  createTemplate: 'pods/createTemplate',
  updateTemplate: 'pods/updateTemplate',
  listTemplates: 'pods/listTemplates',
  listTemplatesAndTags: 'pods/listTemplatesAndTags',

  // Images
  getImage: 'pods/getImage',
  createImage: 'pods/createImage',
  listImages: 'pods/listImages',

  // Snapshots
  getSnapshot: 'pods/getSnapshot',
  createSnapshot: 'pods/createSnapshot',
  deleteSnapshot: 'pods/deleteSnapshot',
  updateSnapshot: 'pods/updateSnapshot',
  listSnapshots: 'pods/listSnapshots',
  getSnapshotPermissions: 'pods/getSnapshotPermissions',
  setSnapshotPermission: 'pods/setSnapshotPermission',
  deleteSnapshotPermission: 'pods/deleteSnapshotPermission',
  listSnapshotFiles: 'pods/listSnapshotFiles',

  // Volumes
  getVolume: 'pods/getVolume',
  createVolume: 'pods/createVolume',
  deleteVolume: 'pods/deleteVolume',
  updateVolume: 'pods/updateVolume',
  listVolumes: 'pods/listVolumes',
  getVolumePermissions: 'pods/getVolumePermissions',
  setVolumePermission: 'pods/setVolumePermission',
  deleteVolumePermission: 'pods/deleteVolumePermission',
  listVolumeFiles: 'pods/listVolumeFiles',
  uploadToVolume: 'pods/uploadToVolume',

  // Template Tags
  getTemplateTag: 'pods/getTemplateTag',
  createTemplateTag: 'pods/createTemplateTag',
  listTemplateTags: 'pods/listTemplateTags',
};

export default QueryKeys;
