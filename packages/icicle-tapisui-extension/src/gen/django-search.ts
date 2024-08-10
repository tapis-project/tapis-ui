export const task = {
  id: 'django-search',
  type: 'function',
  execution_profile: {
    flavor: 'c1med',
  },
  input: {
    OBJECT: {
      type: 'string',
      description: 'Django search parameter - object',
      required: false,
      value_from: {
        args: 'OBJECT',
      },
    },
    PREDICATE: {
      type: 'string',
      description: 'Django search parameter - predicate',
      required: false,
      value_from: {
        args: 'PREDICATE',
      },
    },
    API_HOST: {
      type: 'string',
      description: 'Django API host url',
      required: false,
      value_from: {
        args: 'API_HOST',
      },
    },
  },
  installer: 'pip',
  packages: ['pandas==2.1.4', 'requests'],
  runtime: 'python:3.9',
  entrypoint: '/icicle-task-templates/task-templates/django_search.py',
  git_repositories: [
    {
      url: 'https://github.com/ICICLE-ai/tapisui-extension-icicle.git',
      branch: 'main',
      directory: 'icicle-task-templates',
    },
  ],
  code: 'Iy0tLS0tLS0tIFdvcmtmbG93IENvbnRleHQgaW1wb3J0OiBETyBOT1QgUkVNT1ZFIC0tLS0tLS0tLS0tLS0tLS0KZnJvbSBvd2VfcHl0aG9uX3Nkay5ydW50aW1lIGltcG9ydCBleGVjdXRpb25fY29udGV4dCBhcyBjdHgKIy0tLS0tLS0tIFdvcmtmbG93IENvbnRleHQgaW1wb3J0OiBETyBOT1QgUkVNT1ZFIC0tLS0tLS0tLS0tLS0tLS0KCmltcG9ydCB1dWlkCmltcG9ydCBwYW5kYXMgYXMgcGQKaW1wb3J0IHJlcXVlc3RzCmltcG9ydCBsb2dnaW5nCmZyb20gdHlwaW5nIGltcG9ydCBMaXN0CmltcG9ydCB0aW1lCmltcG9ydCBqc29uCgojIEFQSSBFbmRwb2ludCBjb25maWd1cmF0aW9uCkFQSV9IT1NUID0gY3R4LmdldF9pbnB1dCgiQVBJX0hPU1QiLCAiaHR0cHM6Ly9pY2Zvb2RzLWtub3cubzE4cy5jb20vYXBpL2tub3ciKQpBUElfVVJMX0NSRUFURV9DT05DRVBUID0gZiJ7QVBJX0hPU1R9L2NvbmNlcHQvY3JlYXRlLyIKQVBJX1VSTF9DUkVBVEVfSU5TVEFOQ0UgPSBmIntBUElfSE9TVH0vaW5zdGFuY2UvY3JlYXRlLyIKQVBJX1VSTF9DUkVBVEVfUkVMQVRJT04gPSBmIntBUElfSE9TVH0vcmVsYXRpb24vY3JlYXRlLyIKQVBJX1VSTF9DUkVBVEVfUFJPUE9TSVRJT04gPSBmIntBUElfSE9TVH0vcHJvcG9zaXRpb24vY3JlYXRlLyIKUFJPUE9TSVRJT05TX1NFQVJDSF9VUkwgPSBmIntBUElfSE9TVH0vcHJvcG9zaXRpb25zLyIKCgpkZWYgc2VhcmNoX3N1YmplY3RzKG9iamVjdDogc3RyLCBwcmVkaWNhdGU6IHN0cikgLT4gTGlzdFtzdHJdOgogICAgIiIiCiAgICBTZWFyY2ggZm9yIHByb3Bvc2l0aW9ucyBiYXNlZCBvbiB0aGUgZ2l2ZW4gb2JqZWN0IGFuZCBwcmVkaWNhdGUuCgogICAgQXJnczoKICAgICAgICBvYmplY3Q6IFRoZSBvYmplY3Qgb2YgdGhlIHByb3Bvc2l0aW9ucy4KICAgICAgICBwcmVkaWNhdGU6IFRoZSBwcmVkaWNhdGUgb2YgdGhlIHByb3Bvc2l0aW9ucy4KCiAgICBSZXR1cm5zOgogICAgICAgIEEgbGlzdCBvZiBzdWJqZWN0IGxhYmVscyBmcm9tIHRoZSBzZWFyY2ggcmVzdWx0cy4KICAgICIiIgogICAgdXJsID0gZiJ7UFJPUE9TSVRJT05TX1NFQVJDSF9VUkx9b2JqZWN0L3tvYmplY3R9L3ByZWRpY2F0ZS97cHJlZGljYXRlfS8iCiAgICB0cnk6CiAgICAgICAgcmVzcG9uc2UgPSByZXF1ZXN0cy5nZXQodXJsKQogICAgICAgIHJlc3BvbnNlLnJhaXNlX2Zvcl9zdGF0dXMoKQogICAgICAgIGRhdGEgPSByZXNwb25zZS5qc29uKCkKICAgICAgICBzdWJqZWN0cyA9IFtdCiAgICAgICAgZm9yIG9iaiBpbiBkYXRhOgogICAgICAgICAgICBzdWJqZWN0cy5hcHBlbmQob2JqLmdldCgic3ViamVjdF9sYWJlbCIpKQogICAgICAgIHJldHVybiBzdWJqZWN0cwogICAgZXhjZXB0IHJlcXVlc3RzLlJlcXVlc3RFeGNlcHRpb24gYXMgZToKICAgICAgICBtc2cgPSBmIkZhaWxlZCB0byBzZWFyY2ggcHJvcG9zaXRpb25zOiB7ZX0iCiAgICAgICAgY3R4LnN0ZGVycigxLCBtc2cpCgoKaW5wX29iamVjdCA9IGN0eC5nZXRfaW5wdXQoIk9CSkVDVCIsIGRlZmF1bHQ9Im9iamVjdFN0ciIpCmlucF9wcmVkaWNhdGUgPSBjdHguZ2V0X2lucHV0KCJQUkVESUNBVEUiLCBkZWZhdWx0PSJwcmVkaWNhdGVTdHIiKQoKdHJ5OgogICAgc3ViamVjdHMgPSBzZWFyY2hfc3ViamVjdHMoaW5wX29iamVjdCwgaW5wX3ByZWRpY2F0ZSkKZXhjZXB0IEV4Y2VwdGlvbiBhcyBlOgogICAgY3R4LnN0ZGVycigxLCBmIkZhaWxlZCB0byBhdXRoZW50aWNhdGU6IHtlfSIpCgoKY3R4LnNldF9vdXRwdXQoImRqYW5nb19zZWFyY2hfcmVzdWx0cyIsIGpzb24uZHVtcHMoc3ViamVjdHMpKQoK',
};
