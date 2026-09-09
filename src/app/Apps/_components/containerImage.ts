/**
 * Reading an app's containerImage.
 *
 * The field is a single string that can be any of four quite different
 * things, and all of them are too long to print:
 *
 *   docker.io/library/ubuntu:22.04
 *   /work/projects/aci/cic/apps/yolo_finetune/finetune_arm64_latest.sif
 *   https://github.com/tapis-project/FlexServ-Deployer/releases/download/
 *     tapis-flexserv-1.4.0/Tapis-FlexServ-1.4.0.sif
 *   library/ubuntu
 *
 * What someone wants off a glance is "what is this app actually running" —
 * the image name, and whether it comes from a registry, a file on the exec
 * system, or a download. The rest is provenance for hovering.
 *
 * Not always a container, either: a ZIP app points this at its payload, which
 * may be a plain .zip or tarball. Calling that an 'image' would be a lie, so
 * the archive case is named separately and gets its own glyph.
 */

export type ContainerImageKind = 'docker' | 'file' | 'url';

export type ContainerImageRef = {
  kind: ContainerImageKind;
  /** the short thing to print: image:tag, or a file name */
  name: string;
  /** where it comes from, in two or three words */
  origin: string;
  /** true for a ZIP app's payload — an archive, not a container at all */
  archive: boolean;
  /** set when we can send someone somewhere USEFUL — not a raw download */
  href?: string;
  /** names the destination, e.g. 'the GitHub release' */
  linkLabel?: string;
  /** the untouched value, for the tooltip and the clipboard */
  full: string;
};

const DOCKER_REGISTRY = /^(?:[a-z0-9-]+(?:\.[a-z0-9-]+)+(?::\d+)?)\//i;

// A ZIP app points containerImage at its payload, which is not an image.
const ARCHIVE = /\.(zip|tar|tgz|tar\.gz|tar\.bz2|tar\.xz)$/i;

const payloadWords = (name: string) =>
  ARCHIVE.test(name) ? 'archive' : 'image';

/**
 * Where to send someone who wants to know more.
 *
 * Deliberately not "the URL itself". A release asset URL downloads a 400MB
 * .sif or .zip the moment it is clicked, which is nobody's intent when they
 * press a chip to find out what an app runs — the release page is what they
 * expected. And an arbitrary host gets no link at all: only GitHub and Docker
 * Hub have a page we can predict, so those are the only two we offer.
 */
const GITHUB_RELEASE_ASSET =
  /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\//i;
const GITHUB_ANY = /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/?#]+)/i;
const GITHUB_RAW =
  /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\//i;

const urlLink = (
  full: string
): Pick<ContainerImageRef, 'href' | 'linkLabel'> => {
  const release = GITHUB_RELEASE_ASSET.exec(full);
  if (release) {
    const [, owner, repo, tag] = release;
    return {
      href: `https://github.com/${owner}/${repo}/releases/tag/${tag}`,
      linkLabel: 'the GitHub release',
    };
  }
  const repoMatch = GITHUB_ANY.exec(full) ?? GITHUB_RAW.exec(full);
  if (repoMatch) {
    const [, owner, repo] = repoMatch;
    return {
      href: `https://github.com/${owner}/${repo.replace(/\.git$/, '')}`,
      linkLabel: 'the GitHub repository',
    };
  }
  // somewhere else entirely — we have no page to offer, only the download
  return {};
};

const DOCKER_HUB_HOSTS = new Set(['docker.io', 'index.docker.io']);

/** Docker Hub is the one registry whose page we can build from the ref. */
const dockerLink = (
  registryHost: string | undefined,
  repository: string
): Pick<ContainerImageRef, 'href' | 'linkLabel'> => {
  if (registryHost && !DOCKER_HUB_HOSTS.has(registryHost)) return {};
  // drop the tag or digest — the page is about the repository
  const repo = repository.split('@')[0].replace(/:[^:/]+$/, '');
  if (!repo) return {};
  return {
    // official images live under /_/, everything else under /r/<namespace>/
    href: repo.includes('/')
      ? `https://hub.docker.com/r/${repo}`
      : `https://hub.docker.com/_/${repo}`,
    linkLabel: 'Docker Hub',
  };
};

/**
 * Classify a containerImage and pick the part worth showing.
 *
 * The three cases are told apart by shape rather than by the app's `runtime`,
 * because a ZIP or Singularity app can legitimately point at a docker ref and
 * a docker app can point at a local tarball — the string is the evidence.
 */
export const parseContainerImage = (
  value?: string
): ContainerImageRef | undefined => {
  const full = value?.trim();
  if (!full) return undefined;

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(full)) {
    // a download: the file at the end is the identity, the host is provenance
    const withoutQuery = full.split(/[?#]/)[0];
    const name = withoutQuery.split('/').filter(Boolean).pop() ?? full;
    let host = '';
    try {
      host = new URL(full).hostname;
    } catch {
      host = 'remote';
    }
    return {
      kind: 'url',
      name,
      origin: `${payloadWords(name)} downloaded from ${host}`,
      archive: ARCHIVE.test(name),
      ...urlLink(full),
      full,
    };
  }

  if (full.startsWith('/') || full.startsWith('./') || full.startsWith('~')) {
    const name = full.split('/').filter(Boolean).pop() ?? full;
    return {
      kind: 'file',
      name,
      origin: `${payloadWords(name)} on the exec system`,
      archive: ARCHIVE.test(name),
      full,
    };
  }

  // Everything else is a registry reference. Drop the registry host and the
  // 'library/' namespace docker hub implies, keep the repository and tag —
  // 'ubuntu:22.04' is the answer, 'docker.io/library/ubuntu:22.04' is trivia.
  const registry = DOCKER_REGISTRY.exec(full)?.[0];
  let rest = registry ? full.slice(registry.length) : full;
  rest = rest.replace(/^library\//, '');
  const registryHost = registry?.replace(/\/$/, '');
  return {
    kind: 'docker',
    name: rest || full,
    origin: registryHost
      ? `image from ${registryHost}`
      : 'image from Docker Hub',
    archive: false,
    ...dockerLink(registryHost, rest || full),
    full,
  };
};
