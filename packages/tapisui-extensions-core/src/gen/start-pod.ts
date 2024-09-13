export const task = {
  id: 'start-pod',
  description: 'Stops a pod in the Tapis Pods service',
  type: 'function',
  execution_profile: {
    flavor: 'c1tiny',
  },
  installer: 'pip',
  packages: ['tapipy'],
  runtime: 'python:3.9',
  entrypoint: '/tapis-owe-functions/functions/pods.py',
  git_repositories: [
    {
      url: 'https://github.com/tapis-project/tapis-workflows-task-templates.git',
      branch: 'master',
      directory: 'tapis-owe-functions',
    },
  ],
  input: {
    TAPIS_BASE_URL: {
      type: 'string',
      value_from: {
        env: 'TAPIS_BASE_URL',
      },
    },
    TAPIS_USERNAME: {
      type: 'string',
      value_from: {
        env: 'TAPIS_USERNAME',
      },
    },
    TAPIS_PASSWORD: {
      type: 'string',
      value_from: {
        env: 'TAPIS_PASSWORD',
      },
    },
    TAPIS_JWT: {
      type: 'string',
      value_from: {
        env: 'TAPIS_JWT',
      },
    },
    POD_ID: {
      type: 'string',
      value_from: {
        args: 'POD_ID',
      },
    },
    OPERATION: {
      type: 'string',
      value: 'START',
    },
    POLL_INTERVAL: {
      type: 'string',
      value_from: {
        args: 'POLL_INTERVAL',
      },
    },
  },
  output: {
    POD: {
      type: 'string',
    },
    POD_URL: {
      type: 'string',
    },
  },
  code: 'Iy0tLS0tLS0tIFdvcmtmbG93IENvbnRleHQgaW1wb3J0OiBETyBOT1QgUkVNT1ZFIC0tLS0tLS0tLS0tLS0tLS0KZnJvbSBvd2VfcHl0aG9uX3Nkay5ydW50aW1lIGltcG9ydCBleGVjdXRpb25fY29udGV4dCBhcyBjdHgKIy0tLS0tLS0tIFdvcmtmbG93IENvbnRleHQgaW1wb3J0OiBETyBOT1QgUkVNT1ZFIC0tLS0tLS0tLS0tLS0tLS0KCmltcG9ydCB0aW1lCgpmcm9tIHRhcGlweS50YXBpcyBpbXBvcnQgVGFwaXMKCgp1c2VybmFtZSA9IGN0eC5nZXRfaW5wdXQoIlRBUElTX1VTRVJOQU1FIikKcGFzc3dvcmQgPSBjdHguZ2V0X2lucHV0KCJUQVBJU19QQVNTV09SRCIpCmp3dCA9IGN0eC5nZXRfaW5wdXQoIlRBUElTX0pXVCIpCgppZiAodXNlcm5hbWUgPT0gTm9uZSBvciBwYXNzd29yZCA9PSBOb25lKSBhbmQgand0ID09IE5vbmU6CiAgICBjdHguc3RkZXJyKDEsICJVbmFibGUgdG8gYXV0aGVudGljYXRlIHdpdGggdGFwaXM6IE11c3QgcHJvdmlkZSBlaXRoZXIgYSB1c2VybmFtZSB3aXRoIGEgcGFzc3dvcmQgb3IgYSBKV1QiKQoKa3dhcmdzID0gewogICAgInVzZXJuYW1lIjogdXNlcm5hbWUsCiAgICAicGFzc3dvcmQiOiBwYXNzd29yZCwKICAgICJqd3QiOiBqd3QKfQoKdHJ5OgogICAgdCA9IFRhcGlzKAogICAgICAgIGJhc2VfdXJsPWN0eC5nZXRfaW5wdXQoIlRBUElTX0JBU0VfVVJMIiksCiAgICAgICAgKiprd2FyZ3MKICAgICkKICAgIAogICAgaWYgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIGFuZCBub3Qgand0OgogICAgICAgIHQuZ2V0X3Rva2VucygpCmV4Y2VwdCBFeGNlcHRpb24gYXMgZToKICAgIGN0eC5zdGRlcnIoMSwgZiJGYWlsZWQgdG8gYXV0aGVudGljYXRlOiB7ZX0iKQoKcG9kX2lkID0gY3R4LmdldF9pbnB1dCgiUE9EX0lEIikKb3BlcmF0aW9uX25hbWUgPSBjdHguZ2V0X2lucHV0KCJPUEVSQVRJT04iKQp0cnk6CiAgICBvcGVyYXRpb24gPSBnZXRhdHRyKHQucG9kcywgb3BlcmF0aW9uX25hbWUsIE5vbmUpCiAgICBpZiBvcGVyYXRpb24gPT0gTm9uZSBvciBvcGVyYXRpb25fbmFtZSBub3QgaW4gWyJTVEFSVCIsICJTVE9QIiwgIlJFU1RBUlQiXToKICAgICAgICBjdHguc3RkZXJyKGYiSW52YWxpZCBvcGVyYXRpb246IE9wZXJhdGlvbiAne29wZXJhdGlvbl9uYW1lfScgZG9lcyBub3QgZXhpc3Qgb24gdGhlIHBvZHMgcmVzb3VyY2UiKQoKICAgIHBvZCA9IG9wZXJhdGlvbihwb2RfaWQ9cG9kX2lkKQoKICAgIG9wX2NvbXBsZXRlX3N0YXR1cyA9ICJBVkFJTEFCTEUiCiAgICBpZiBwb2Quc3RhdHVzX3JlcXVlc3RlZCA9PSAiT0ZGIjoKICAgICAgICBvcF9jb21wbGV0ZV9zdGF0dXMgPSAiU1RPUFBFRCIKICAgICAgICAKICAgIHBvbGxfaW50ZXJ2YWwgPSBpbnQoY3R4LmdldF9pbnB1dCgiUE9MTF9JTlRFUlZBTCIpKQogICAgd2hpbGUgcG9kLnN0YXR1cyAhPSBvcF9jb21wbGV0ZV9zdGF0dXM6CiAgICAgICAgdGltZS5zbGVlcChwb2xsX2ludGVydmFsKQogICAgICAgIHBvZCA9IHQucG9kcy5nZXRfcG9kKHBvZF9pZD1wb2RfaWQpCiAgICAKICAgIGN0eC5zZXRfb3V0cHV0KCJQT0QiLCBwb2QuX19kaWN0X18pCiAgICBjdHguc2V0X291dHB1dCgiVVJMIiwgZiJ7cG9kLm5ldHdvcmtpbmcucHJvdG9jb2x9Oi8ve3BvZC5uZXR3b3JraW5nLnVybH0iKQogICAgY3R4LnN0ZG91dCgpCiAgICAKZXhjZXB0IEV4Y2VwdGlvbiBhcyBlOgogICAgY3R4LnN0ZGVycihmIlJlcXVlc3QgZmFpbGVkIGZvciBwb2Qgb3BlcmF0aW9uICd7b3BlcmF0aW9ufSc6IHtlfSIp',
};
