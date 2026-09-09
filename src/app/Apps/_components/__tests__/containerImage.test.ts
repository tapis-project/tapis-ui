import { parseContainerImage } from '../containerImage';

describe('parseContainerImage', () => {
  it('names the file behind a release download, and where it came from', () => {
    const url =
      'https://github.com/tapis-project/FlexServ-Deployer/releases/download/tapis-flexserv-1.4.0/Tapis-FlexServ-1.4.0.sif';
    expect(parseContainerImage(url)).toEqual({
      kind: 'url',
      name: 'Tapis-FlexServ-1.4.0.sif',
      origin: 'image downloaded from github.com',
      archive: false,
      // the release page, NOT the 400MB asset the raw URL would fetch
      href: 'https://github.com/tapis-project/FlexServ-Deployer/releases/tag/tapis-flexserv-1.4.0',
      linkLabel: 'the GitHub release',
      full: url,
    });
  });

  it('names the image file at the end of a scratch path', () => {
    const path =
      '/work/projects/aci/cic/apps/yolo_finetune/finetune_arm64_latest.sif';
    expect(parseContainerImage(path)).toEqual({
      kind: 'file',
      name: 'finetune_arm64_latest.sif',
      origin: 'image on the exec system',
      archive: false,
      full: path,
    });
  });

  it('drops the registry trivia from a docker reference', () => {
    expect(parseContainerImage('docker.io/library/ubuntu:22.04')).toMatchObject(
      { kind: 'docker', name: 'ubuntu:22.04', origin: 'image from docker.io' }
    );
    expect(parseContainerImage('ghcr.io/tapis/flexserv:1.4.0')).toMatchObject({
      name: 'tapis/flexserv:1.4.0',
      origin: 'image from ghcr.io',
    });
  });

  it('treats a bare reference as Docker Hub', () => {
    expect(parseContainerImage('ubuntu:22.04')).toMatchObject({
      kind: 'docker',
      name: 'ubuntu:22.04',
      origin: 'image from Docker Hub',
    });
    // 'library/' is the namespace the hub implies — it says nothing
    expect(parseContainerImage('library/ubuntu')).toMatchObject({
      name: 'ubuntu',
    });
  });

  it('does not call a ZIP app payload an image', () => {
    // a fork/ZIP app legitimately points at an archive, not a container
    expect(
      parseContainerImage(
        'https://github.com/org/repo/releases/download/v1/app.zip'
      )
    ).toMatchObject({
      name: 'app.zip',
      archive: true,
      origin: 'archive downloaded from github.com',
    });
    expect(parseContainerImage('/work/apps/bundle.tar.gz')).toMatchObject({
      archive: true,
      origin: 'archive on the exec system',
    });
  });

  it('sends you to the release page, not the download', () => {
    const zip =
      'https://github.com/tapis-project/FlexServ-Deployer/releases/download/tapis-flexserv-1.4.0/Tapis-FlexServ.zip';
    expect(parseContainerImage(zip)).toMatchObject({
      name: 'Tapis-FlexServ.zip',
      archive: true,
      href: 'https://github.com/tapis-project/FlexServ-Deployer/releases/tag/tapis-flexserv-1.4.0',
      linkLabel: 'the GitHub release',
    });
  });

  it('falls back to the repository for other GitHub URLs', () => {
    expect(
      parseContainerImage('https://github.com/org/repo/blob/main/x.sif')
    ).toMatchObject({
      href: 'https://github.com/org/repo',
      linkLabel: 'the GitHub repository',
    });
    expect(
      parseContainerImage('https://raw.githubusercontent.com/org/repo/main/a')
    ).toMatchObject({ href: 'https://github.com/org/repo' });
  });

  it('links a Docker Hub image to its page, official or not', () => {
    expect(parseContainerImage('ubuntu:22.04')).toMatchObject({
      href: 'https://hub.docker.com/_/ubuntu',
      linkLabel: 'Docker Hub',
    });
    expect(parseContainerImage('docker.io/tapis/flexserv:1.4')).toMatchObject({
      href: 'https://hub.docker.com/r/tapis/flexserv',
    });
  });

  it('offers no link where there is no page to offer', () => {
    // a host we cannot predict a page for — the raw URL would just download
    expect(
      parseContainerImage('https://data.tacc.utexas.edu/img.sif')?.href
    ).toBeUndefined();
    // another registry: its layout is not ours to guess
    expect(
      parseContainerImage('ghcr.io/tapis/flexserv:1.4.0')?.href
    ).toBeUndefined();
    // a path on someone else's filesystem is not an address
    expect(parseContainerImage('/work/apps/a.sif')?.href).toBeUndefined();
    expect(parseContainerImage('ftp://host/a.sif')?.href).toBeUndefined();
  });

  it('has nothing to say about a missing image', () => {
    expect(parseContainerImage(undefined)).toBeUndefined();
    expect(parseContainerImage('   ')).toBeUndefined();
  });

  it('does not choke on a URL with a query string', () => {
    expect(
      parseContainerImage('https://example.org/a/b/img.sif?token=xyz')
    ).toMatchObject({ name: 'img.sif' });
  });
});
