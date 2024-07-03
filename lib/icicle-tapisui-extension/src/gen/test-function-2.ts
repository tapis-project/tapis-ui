export const task = {
  id: 'test-function-2',
  type: 'function',
  execution_profile: {
    flavor: 'c1tiny',
  },
  installer: 'pip',
  packages: ['tapipy'],
  runtime: 'python:3.9',
  entrypoint: '/tapis-owe-functions/functions/tapis-etl-push-pull-data.py',
  git_repositories: [
    {
      url: 'https://github.com/tapis-project/tapis-workflows-task-templates.git',
      branch: 'master',
      directory: 'tapis-owe-functions',
    },
  ],
  code: 'IiIiVHJhbnNmZXJzIGRhdGEgZmlsZXMgZnJvbSB0aGUgUmVtb3RlIE91dGJveCB0byB0aGUgTG9jYWwgSW5ib3giIiIKCiMtLS0tLS0tLSBXb3JrZmxvdyBDb250ZXh0IGltcG9ydDogRE8gTk9UIFJFTU9WRSAtLS0tLS0tLS0tLS0tLS0tCmZyb20gb3dlX3B5dGhvbl9zZGsucnVudGltZSBpbXBvcnQgZXhlY3V0aW9uX2NvbnRleHQgYXMgY3R4CiMtLS0tLS0tLSBXb3JrZmxvdyBDb250ZXh0IGltcG9ydDogRE8gTk9UIFJFTU9WRSAtLS0tLS0tLS0tLS0tLS0tCgppbXBvcnQganNvbiwgb3MKCmZyb20gY29uc3RhbnRzLmV0bCBpbXBvcnQgTE9DS0ZJTEVfRklMRU5BTUUKZnJvbSB1dGlscy5ldGwgaW1wb3J0ICgKICAgIE1hbmlmZXN0TW9kZWwsCiAgICBNYW5pZmVzdHNMb2NrLAogICAgRW51bU1hbmlmZXN0U3RhdHVzLAogICAgRW51bVBoYXNlLAogICAgcG9sbF90cmFuc2Zlcl90YXNrLAogICAgZ2V0X3RhcGlzX2ZpbGVfY29udGVudHNfanNvbiwKICAgIGZldGNoX3N5c3RlbV9maWxlcywKICAgIHZhbGlkYXRlX21hbmlmZXN0X2RhdGFfZmlsZXMsCiAgICBjbGVhbnVwCikKZnJvbSB1dGlscy50YXBpcyBpbXBvcnQgZ2V0X2NsaWVudAoKCiMgSW5zdGFudGlhdGUgYSBUYXBpcyBjbGllbnQKdHJ5OgogICAgY2xpZW50ID0gZ2V0X2NsaWVudCgKICAgICAgICBjdHguZ2V0X2lucHV0KCJUQVBJU19CQVNFX1VSTCIpLAogICAgICAgIHVzZXJuYW1lPWN0eC5nZXRfaW5wdXQoIlRBUElTX1VTRVJOQU1FIiksCiAgICAgICAgcGFzc3dvcmQ9Y3R4LmdldF9pbnB1dCgiVEFQSVNfUEFTU1dPUkQiKSwKICAgICAgICBqd3Q9Y3R4LmdldF9pbnB1dCgiVEFQSVNfSldUIikKICAgICkKZXhjZXB0IEV4Y2VwdGlvbiBhcyBlOgogICAgY3R4LnN0ZGVycihzdHIoZSkpCgojIERlc2VyaWFsaXplIHN5c3RlbSBkZXRhaWxzCnRyeToKICAgIGVncmVzc19zeXN0ZW0gPSBqc29uLmxvYWRzKGN0eC5nZXRfaW5wdXQoIkVHUkVTU19TWVNURU0iKSkKICAgIGluZ3Jlc3Nfc3lzdGVtID0ganNvbi5sb2FkcyhjdHguZ2V0X2lucHV0KCJJTkdSRVNTX1NZU1RFTSIpKQpleGNlcHQganNvbi5KU09ORGVjb2RlRXJyb3IgYXMgZToKICAgIGN0eC5zdGRlcnIoMSwgZiJ7ZX0iKQoKIyBTZXQgdGhlIHBoYXNlLWRlcGVuZGVudCB2YXJpYWJsZXMKcGhhc2UgPSBjdHguZ2V0X2lucHV0KCJQSEFTRSIpCgojIFRoZSB0aGF0IGhhcyB0aGUgbWFuaWZlc3QgZmlsZXMgZm9yIHRoaXMgcGhhc2Ugb2YgdGhlIHBpcGVsaW5lCm1hbmlmZXN0c19zeXN0ZW0gPSBpbmdyZXNzX3N5c3RlbSBpZiBwaGFzZSA9PSBFbnVtUGhhc2UuSW5ncmVzcyBlbHNlIGVncmVzc19zeXN0ZW0KCnRyeToKICAgICMgTG9jayB0aGUgbWFuaWZlc3RzIGRpcmVjdG9yeSB0byBwcmV2ZW50IG90aGVyIGNvbmN1cnJlbnQgcGlwZWxpbmUgcnVucwogICAgIyBmcm9tIG11dGF0aW5nIG1hbmlmZXN0IGZpbGVzCiAgICBsb2NrID0gTWFuaWZlc3RzTG9jayhjbGllbnQsIG1hbmlmZXN0c19zeXN0ZW0pCiAgICBsb2NrLmFjcXVpcmUoKQoKICAgICMgUmVnaXN0ZXIgdGhlIGxvY2sgcmVsZWFzZSBob29rIHRvIGJlIGNhbGxlZCBvbiBjYWxsZWQgdG8gc3RkZXJyIGFuZAogICAgIyBzdGRvdXQuIFRoaXMgd2lsbCB1bmxvY2sgdGhlIG1hbmlmZXN0cyBsb2NrIHdoZW4gdGhlIHByb2dyYW0gZXhpdHMgd2l0aCBhbnkKICAgICMgY29kZQogICAgY3R4LmFkZF9ob29rKDEsIGxvY2sucmVsZWFzZSkKICAgIGN0eC5hZGRfaG9vaygwLCBsb2NrLnJlbGVhc2UpCmV4Y2VwdCBFeGNlcHRpb24gYXMgZToKICAgIGN0eC5zdGRlcnIoMSwgZiJGYWlsZWQgdG8gbG9jayBwaXBlbGluZToge3N0cihlKX0iKQoKIyBMb2FkIGFsbCBtYW5maWVzdCBmaWxlcyBmcm9tIHRoZSBtYW5pZmVzdHMgZGlyZWN0b3J5IG9mIHRoZSBtYW5pZmVzdHMgc3lzdGVtCnRyeToKICAgIG1hbmlmZXN0X2ZpbGVzID0gZmV0Y2hfc3lzdGVtX2ZpbGVzKAogICAgICAgIHN5c3RlbV9pZD1tYW5pZmVzdHNfc3lzdGVtLmdldCgibWFuaWZlc3RzIikuZ2V0KCJzeXN0ZW1faWQiKSwKICAgICAgICBwYXRoPW1hbmlmZXN0c19zeXN0ZW0uZ2V0KCJtYW5pZmVzdHMiKS5nZXQoInBhdGgiKSwKICAgICAgICBjbGllbnQ9Y2xpZW50LAogICAgICAgIGluY2x1ZGVfcGF0dGVybnM9bWFuaWZlc3RzX3N5c3RlbS5nZXQoIm1hbmlmZXN0cyIpLmdldCgiaW5jbHVkZV9wYXR0ZXJucyIpLAogICAgICAgIGV4Y2x1ZGVfcGF0dGVybnM9WwogICAgICAgICAgICAqbWFuaWZlc3RzX3N5c3RlbS5nZXQoIm1hbmlmZXN0cyIpLmdldCgiZXhjbHVkZV9wYXR0ZXJucyIpLAogICAgICAgICAgICBMT0NLRklMRV9GSUxFTkFNRSAjIElnbm9yZSB0aGUgbG9ja2ZpbGUuCiAgICAgICAgXQogICAgKQpleGNlcHQgRXhjZXB0aW9uIGFzIGU6CiAgICBjdHguc3RkZXJyKDEsIGYiRmFpbGVkIHRvIGZldGNoIG1hbmlmZXN0IGZpbGVzOiB7ZX0iKQoKIyBMb2FkIG1hbmlmZXN0cyB0aGF0IGhhdmUgdGhlIGN1cnJlbnQgcGhhc2UKdHJ5OgogICAgbWFuaWZlc3RzID0gW10KICAgIGZvciBtYW5pZmVzdF9maWxlIGluIG1hbmlmZXN0X2ZpbGVzOgogICAgICAgIG1hbmlmZXN0ID0gTWFuaWZlc3RNb2RlbCgKICAgICAgICAgICAgZmlsZW5hbWU9bWFuaWZlc3RfZmlsZS5uYW1lLAogICAgICAgICAgICBwYXRoPW1hbmlmZXN0X2ZpbGUucGF0aCwKICAgICAgICAgICAgdXJsPW1hbmlmZXN0X2ZpbGUudXJsLAogICAgICAgICAgICAqKmpzb24ubG9hZHMoCiAgICAgICAgICAgICAgICBnZXRfdGFwaXNfZmlsZV9jb250ZW50c19qc29uKAogICAgICAgICAgICAgICAgICAgIGNsaWVudCwKICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdHNfc3lzdGVtLmdldCgibWFuaWZlc3RzIikuZ2V0KCJzeXN0ZW1faWQiKSwKICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdF9maWxlLnBhdGgKICAgICAgICAgICAgICAgICkKICAgICAgICAgICAgKQogICAgICAgICkKCiAgICAgICAgaWYgKAogICAgICAgICAgICBtYW5pZmVzdC5waGFzZSA9PSBwaGFzZQogICAgICAgICAgICBhbmQgbWFuaWZlc3Quc3RhdHVzICE9IEVudW1NYW5pZmVzdFN0YXR1cy5Db21wbGV0ZWQKICAgICAgICApOgogICAgICAgICAgICBtYW5pZmVzdHMuYXBwZW5kKG1hbmlmZXN0KQpleGNlcHQgRXhjZXB0aW9uIGFzIGU6CiAgICBjdHguc3RkZXJyKDEsIGYiRmFpbGVkIHRvIGluaXRpYWxpemUgbWFuaWZlc3RzOiB7ZX0iKQoKIyBUcmFuc2ZlciBhbGwgZmlsZXMgaW4gZWFjaCBtYW5pZmVzdCB0byB0aGUgZGF0YSBkaXJlY3Rvcnkgb2YgdGhlIGluZ3Jlc3Mgc3lzdGVtCmZvciBtYW5pZmVzdCBpbiBtYW5pZmVzdHM6CiAgICAjIFdoaWNoIHByb3BlcnR5IGNvbnRhaW5zIHRoZSBjb3JyZWN0IGRhdGEgZmlsZXMgZGVwZW5kcyBvbiB0aGUgcGhhc2UuIEZvciB0aGUKICAgICMgaW5ncmVzcyBwaGFzZSBpdCdzIHJlbW90ZV9maWxlcyBhbmQgZm9yIGVncmVzcyBpdCdzIGxvY2FsX2ZpbGVzCiAgICBkYXRhX2ZpbGVzID0gZ2V0YXR0cihtYW5pZmVzdCwgImxvY2FsX2ZpbGVzIikKICAgIGlmIHBoYXNlID09IEVudW1QaGFzZS5JbmdyZXNzOgogICAgICAgIGRhdGFfZmlsZXMgPSBnZXRhdHRyKG1hbmlmZXN0LCAicmVtb3RlX2ZpbGVzIikKCiAgICAjIENoZWNrIHRvIHNlZSBpZiB0aGUgZGF0YSBmaWxlcyBpbiB0aGUgbWFuaWZlc3RzIHBhc3MgZGF0YSBpbnRlZ3JpdHkgY2hlY2tzCiAgICB0cnk6CiAgICAgICAgdmFsaWRhdGVkLCBlcnIgPSB2YWxpZGF0ZV9tYW5pZmVzdF9kYXRhX2ZpbGVzKAogICAgICAgICAgICBlZ3Jlc3Nfc3lzdGVtLAogICAgICAgICAgICBkYXRhX2ZpbGVzLAogICAgICAgICAgICBjbGllbnQKICAgICAgICApCiAgICBleGNlcHQgRXhjZXB0aW9uIGFzIGU6CiAgICAgICAgY3R4LnN0ZGVycigxLCBmIkVycm9yIHZhbGlkYXRpbmcgZGF0YSBpbnRlZ3JpdHk6IHtlfSIpCgogICAgdHJ5OgogICAgICAgICMgTG9nIHRoZSBmYWlsZWQgZGF0YSBpbnRlZ3JpdHkgY2hlY2sgaW4gdGhlIG1hbmlmZXN0CiAgICAgICAgaWYgbm90IHZhbGlkYXRlZDoKICAgICAgICAgICAgbWFuaWZlc3QubG9nKGYiRGF0YSBpbnRlZ3JpdHkgY2hlY2tzIGZhaWxlZCB8IHtlcnJ9IikKICAgICAgICAgICAgbWFuaWZlc3Quc2V0X3N0YXR1cyhFbnVtTWFuaWZlc3RTdGF0dXMuSW50ZWdyaXR5Q2hlY2tGYWlsZWQpCiAgICAgICAgICAgIG1hbmlmZXN0LnNhdmUoaW5ncmVzc19zeXN0ZW0uZ2V0KCJtYW5pZmVzdHMiKS5nZXQoInN5c3RlbV9pZCIpLCBjbGllbnQpCiAgICAgICAgICAgIGNvbnRpbnVlCiAgICAgICAgCiAgICAgICAgbWFuaWZlc3QubG9nKGYiRGF0YSBpbnRlZ3JpdHkgY2hlY2tzIHN1Y2Nlc3NmdWwiKQogICAgICAgIG1hbmlmZXN0LnNhdmUoaW5ncmVzc19zeXN0ZW0uZ2V0KCJtYW5pZmVzdHMiKS5nZXQoInN5c3RlbV9pZCIpLCBjbGllbnQpCiAgICBleGNlcHQgRXhjZXB0aW9uIGFzIGU6CiAgICAgICAgY3R4LnN0ZGVycigxLCBmIkVycm9yIHVwZGF0aW5nIG1hbmlmZXN0OiB7ZX0iKQoKICAgIGVsZW1lbnRzID0gW10KICAgIGZvciBkYXRhX2ZpbGUgaW4gZGF0YV9maWxlczoKICAgICAgICAjIEJ1aWxkIHRoZSB0cmFuc2ZlciBlbGVtZW50cwogICAgICAgIHVybCA9IGRhdGFfZmlsZS5nZXQoInVybCIpCiAgICAgICAgZGVzdGluYXRpb25fc3lzdGVtX2lkID0gaW5ncmVzc19zeXN0ZW0uZ2V0KCJkYXRhIikuZ2V0KCJzeXN0ZW1faWQiKQogICAgICAgIGRlc3RpbmF0aW9uX3BhdGggPSBpbmdyZXNzX3N5c3RlbS5nZXQoImRhdGEiKS5nZXQoInBhdGgiKQogICAgICAgIGRlc3RpbmF0aW9uX2ZpbGVuYW1lID0gdXJsLnJzcGxpdCgiLyIsIDEpWzFdCiAgICAgICAgZGVzdGluYXRpb25fdXJpID0gZiJ0YXBpczovL3tkZXN0aW5hdGlvbl9zeXN0ZW1faWR9L3tvcy5wYXRoLmpvaW4oZGVzdGluYXRpb25fcGF0aC5zdHJpcCgnLycpLCBkZXN0aW5hdGlvbl9maWxlbmFtZSl9IgogICAgICAgIGVsZW1lbnRzLmFwcGVuZCh7CiAgICAgICAgICAgICJzb3VyY2VVUkkiOiBkYXRhX2ZpbGUuZ2V0KCJ1cmwiKSwKICAgICAgICAgICAgImRlc3RpbmF0aW9uVVJJIjogZGVzdGluYXRpb25fdXJpCiAgICAgICAgfSkKCiAgICAjIFRyYW5zZmVyIGVsZW1lbnRzCiAgICB0cnk6CiAgICAgICAgbWFuaWZlc3QubG9nKGYiU3RhcnRpbmcgdHJhbnNmZXIgb2Yge2xlbihlbGVtZW50cyl9IGRhdGEgZmlsZXMgZnJvbSB0aGUgcmVtb3RlIG91dGJveCB0byB0aGUgbG9jYWwgaW5ib3giKQogICAgICAgICMgU3RhcnQgdGhlIHRyYW5zZmVyIHRhc2sgYW5kIHBvbGwgdW50aWwgdGVybWluYWwgc3RhdGUKICAgICAgICB0YXNrID0gY2xpZW50LmZpbGVzLmNyZWF0ZVRyYW5zZmVyVGFzayhlbGVtZW50cz1lbGVtZW50cykKICAgICAgICB0YXNrID0gcG9sbF90cmFuc2Zlcl90YXNrKGNsaWVudCwgdGFzaykKICAgIGV4Y2VwdCBFeGNlcHRpb24gYXMgZToKICAgICAgICBjdHguc3RkZXJyKDEsIGYiRXJyb3IgdHJhbnNmZXJyaW5nIGZpbGVzOiB7ZX0iKQogICAgCiAgICAjIEFkZCB0aGUgdHJhbnNmZXIgZGF0YSB0byB0aGUgbWFuZmllc3QKICAgIG1hbmlmZXN0LnRyYW5zZmVycy5hcHBlbmQodGFzay51dWlkKQoKICAgIHRyeToKICAgICAgICBpZiB0YXNrLnN0YXR1cyAhPSAiQ09NUExFVEVEIjoKICAgICAgICAgICAgdGFza19lcnIgPSBmIlRyYW5zZmVyIHRhc2sgZmFpbGVkIHwgVGFzayBVVUlEOiB7dGFzay51dWlkfSB8IFN0YXR1czogJ3t0YXNrLnN0YXR1c30nIHwgRXJyb3I6IHt0YXNrLmVycm9yTWVzc2FnZX0iCiAgICAgICAgICAgIG1hbmlmZXN0LnNldF9zdGF0dXMoRW51bU1hbmlmZXN0U3RhdHVzLkZhaWxlZCkKICAgICAgICAgICAgbWFuaWZlc3QubG9nKHRhc2tfZXJyKQogICAgICAgICAgICBtYW5pZmVzdC5zYXZlKG1hbmlmZXN0c19zeXN0ZW0uZ2V0KCJtYW5pZmVzdHMiKS5nZXQoInN5c3RlbV9pZCIpLCBjbGllbnQpCiAgICAgICAgICAgIGN0eC5zdGRlcnIoMSwgdGFza19lcnIpCgogICAgICAgIG1hbmlmZXN0LmxvZyhmIlRyYW5zZmVyIHRhc2sgY29tcGxldGVkIHwgVGFzayBVVUlEOiB7dGFzay51dWlkfSIpCiAgICAgICAgbWFuaWZlc3Quc2V0X3N0YXR1cyhFbnVtTWFuaWZlc3RTdGF0dXMuQ29tcGxldGVkKQogICAgICAgIG1hbmlmZXN0LnNhdmUobWFuaWZlc3RzX3N5c3RlbS5nZXQoIm1hbmlmZXN0cyIpLmdldCgic3lzdGVtX2lkIiksIGNsaWVudCkKICAgIGV4Y2VwdCBFeGNlcHRpb24gYXMgZToKICAgICAgICBjdHguc3RkZXJyKDEsIGYiRXJyb3IgdXBkYXRpbmcgbWFuaWZlc3RzIGFmdGVyIHRyYW5zZmVyOiB7ZX0iKQoKdHJ5OgogICAgaWYgcGhhc2UgPT0gRW51bVBoYXNlLkluZ3Jlc3M6CiAgICAgICAgIyBNb2RpZnkgdGhlIHBhdGggYW5kIHVybCBvZiB0aGUgZmlsZXMgdHJhY2tlZCBpbiB0aGUgbWFuaWZlc3QgdG8gcmVwbGFjZQogICAgICAgICMgZWdyZXNzIHN5c3RlbSBwYXRoIGFuZCBzeXN0ZW0gaWQgd2l0aCB0aGUgaW5ncmVzcyBzeXN0ZW0gZGF0YSBwYXRoIGFuZCAKICAgICAgICAjIGluZ3Jlc3Mgc3lzdGVtIHRyYW5zZm9ybSBzeXN0ZW0gaWQKICAgICAgICB1bmNvbnZlcnRlZF9tYW5pZmVzdHMgPSBbCiAgICAgICAgICAgIG1hbmlmZXN0IGZvciBtYW5pZmVzdCBpbiBtYW5pZmVzdHMKICAgICAgICAgICAgaWYgKAogICAgICAgICAgICAgICAgbWFuaWZlc3QucGhhc2UgPT0gRW51bVBoYXNlLkluZ3Jlc3MKICAgICAgICAgICAgICAgIGFuZCBtYW5pZmVzdC5zdGF0dXMgPT0gRW51bU1hbmlmZXN0U3RhdHVzLkNvbXBsZXRlZAogICAgICAgICAgICApCiAgICAgICAgXQoKICAgICAgICBmb3IgdW5jb252ZXJ0ZWRfbWFuaWZlc3QgaW4gdW5jb252ZXJ0ZWRfbWFuaWZlc3RzOgogICAgICAgICAgICBtb2RpZmllZF9kYXRhX2ZpbGVzID0gW10KICAgICAgICAgICAgZm9yIGRhdGFfZmlsZSBpbiB1bmNvbnZlcnRlZF9tYW5pZmVzdC5yZW1vdGVfZmlsZXM6CiAgICAgICAgICAgICAgICBpbmdyZXNzX3N5c3RlbV9pZCA9IGluZ3Jlc3Nfc3lzdGVtLmdldCgiZGF0YSIpLmdldCgic3lzdGVtX2lkIikKICAgICAgICAgICAgICAgIGluZ3Jlc3NfZGF0YV9maWxlc19wYXRoID0gaW5ncmVzc19zeXN0ZW0uZ2V0KCJkYXRhIikuZ2V0KCJwYXRoIikKICAgICAgICAgICAgICAgIHBhdGggPSBvcy5wYXRoLmpvaW4oZiIve2luZ3Jlc3NfZGF0YV9maWxlc19wYXRoLnN0cmlwKCcvJyl9IiwgZGF0YV9maWxlWyJuYW1lIl0pCiAgICAgICAgICAgICAgICBtb2RpZmllZF9kYXRhX2ZpbGVzLmFwcGVuZCh7CiAgICAgICAgICAgICAgICAgICAgKipkYXRhX2ZpbGUsCiAgICAgICAgICAgICAgICAgICAgInVybCI6IGYndGFwaXM6Ly97aW5ncmVzc19zeXN0ZW1faWR9L3tvcy5wYXRoLmpvaW4ocGF0aCwgZGF0YV9maWxlWyJuYW1lIl0pLnN0cmlwKCIvIil9JywKICAgICAgICAgICAgICAgICAgICAicGF0aCI6IHBhdGgKICAgICAgICAgICAgICAgIH0pCiAgICAgICAgICAgIAogICAgICAgICAgICB1bmNvbnZlcnRlZF9tYW5pZmVzdC5sb2NhbF9maWxlcyA9IG1vZGlmaWVkX2RhdGFfZmlsZXMKICAgICAgICAgICAgdW5jb252ZXJ0ZWRfbWFuaWZlc3Quc2V0X3BoYXNlKEVudW1QaGFzZS5UcmFuc2Zvcm0pCiAgICAgICAgICAgIHVuY29udmVydGVkX21hbmlmZXN0LnNhdmUoaW5ncmVzc19zeXN0ZW0uZ2V0KCJtYW5pZmVzdHMiKS5nZXQoInN5c3RlbV9pZCIpLCBjbGllbnQpCmV4Y2VwdCBFeGNlcHRpb24gYXMgZToKICAgIGN0eC5zdGRlcnIoMSwgZiJFcnJvciBjb252ZXJ0aW5nIG1hbmlmZXN0OiB7ZX0iKQoKY2xlYW51cChjdHgpCgo=',
};
