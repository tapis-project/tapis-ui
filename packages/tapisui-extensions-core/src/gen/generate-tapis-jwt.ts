export const task = {
  id: 'generate-tapis-jwt',
  description:
    'Generates a JWT for a given username/password combination at the provided Tapis base url',
  type: 'function',
  execution_profile: {
    flavor: 'c1tiny',
  },
  installer: 'pip',
  packages: ['tapipy'],
  runtime: 'python:3.9',
  entrypoint: '/tapis-owe-functions/functions/tapis-login.py',
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
  },
  output: {
    TAPIS_JWT: {
      type: 'string',
    },
  },
  code: 'Iy0tLS0tLS0tIFdvcmtmbG93IENvbnRleHQgaW1wb3J0OiBETyBOT1QgUkVNT1ZFIC0tLS0tLS0tLS0tLS0tLS0KZnJvbSBvd2VfcHl0aG9uX3Nkay5ydW50aW1lIGltcG9ydCBleGVjdXRpb25fY29udGV4dCBhcyBjdHgKIy0tLS0tLS0tIFdvcmtmbG93IENvbnRleHQgaW1wb3J0OiBETyBOT1QgUkVNT1ZFIC0tLS0tLS0tLS0tLS0tLS0KCmZyb20gdGFwaXB5LnRhcGlzIGltcG9ydCBUYXBpcwoKZnJvbSB1dGlscy50YXBpcyBpbXBvcnQgZ2V0X2NsaWVudAoKdHJ5OgogICAgY2xpZW50ID0gZ2V0X2NsaWVudCgKICAgICAgICBiYXNlX3VybD1jdHguZ2V0X2lucHV0KCJUQVBJU19CQVNFX1VSTCIpLAogICAgICAgIHVzZXJuYW1lPWN0eC5nZXRfaW5wdXQoIlRBUElTX1VTRVJOQU1FIiksCiAgICAgICAgcGFzc3dvcmQ9Y3R4LmdldF9pbnB1dCgiVEFQSVNfUEFTU1dPUkQiKSwKICAgICAgICBqd3Q9Y3R4LmdldF9pbnB1dCgiVEFQSVNfSldUIikKICAgICkKCiAgICBjdHguc2V0X291dHB1dCgiVEFQSVNfSldUIiwgY2xpZW50LmdldF9hY2Nlc3Nfand0KCkpCiAgICBjdHguc3Rkb3V0KCJTdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZCIpCmV4Y2VwdCBFeGNlcHRpb24gYXMgZToKICAgIGN0eC5zdGRlcnIoMSwgZiJGYWlsZWQgdG8gYXV0aGVudGljYXRlOiB7ZX0iKQ==',
};
