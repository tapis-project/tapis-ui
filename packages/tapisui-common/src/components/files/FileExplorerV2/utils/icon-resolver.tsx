import type { ElementType } from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import TerminalIcon from '@mui/icons-material/Terminal';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import StorageIcon from '@mui/icons-material/Storage';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
  SiC,
  SiCplusplus,
  SiCss,
  SiDart,
  SiDocker,
  SiElixir,
  SiErlang,
  SiGo,
  SiGnubash,
  SiGraphql,
  SiHaskell,
  SiHtml5,
  SiJavascript,
  SiJulia,
  SiJupyter,
  SiKotlin,
  SiLatex,
  SiLess,
  SiLua,
  SiMarkdown,
  SiPerl,
  SiPhp,
  SiPython,
  SiR,
  SiReact,
  SiRuby,
  SiSass,
  SiScala,
  SiSharp,
  SiSvelte,
  SiSwift,
  SiTerraform,
  SiTypescript,
  SiVuedotjs,
} from 'react-icons/si';
import { BsFiletypeYml } from 'react-icons/bs';
import {
  FaFileExcel,
  FaFilePowerpoint,
  FaFileWord,
  FaJava,
  FaRust,
} from 'react-icons/fa6';

// Action Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import ExtensionIcon from '@mui/icons-material/Extension';
import WebhookIcon from '@mui/icons-material/Webhook';
import TransformIcon from '@mui/icons-material/Transform';
import SecurityIcon from '@mui/icons-material/Security';
import BrushIcon from '@mui/icons-material/Brush';

export type FileIconDefinition = Readonly<{
  icon: ElementType;
  color: string;
  source: 'mui' | 'react-icons';
}>;

const muiIcon = (icon: ElementType, color: string): FileIconDefinition => ({
  icon,
  color,
  source: 'mui',
});

const reactIcon = (icon: ElementType, color: string): FileIconDefinition => ({
  icon,
  color,
  source: 'react-icons',
});

const icons = {
  generic: muiIcon(InsertDriveFileIcon, '#94a3b8'),
  image: muiIcon(ImageIcon, '#10b981'),
  pdf: muiIcon(PictureAsPdfIcon, '#ef4444'),
  text: muiIcon(DescriptionIcon, '#64748b'),
  code: muiIcon(CodeIcon, '#3b82f6'),
  data: muiIcon(DataObjectIcon, '#8b5cf6'),
  shell: muiIcon(TerminalIcon, '#0891b2'),
  table: muiIcon(TableChartIcon, '#059669'),
  presentation: muiIcon(SlideshowIcon, '#f97316'),
  audio: muiIcon(AudioFileIcon, '#ec4899'),
  video: muiIcon(VideoFileIcon, '#d946ef'),
  archive: muiIcon(FolderZipIcon, '#ca8a04'),
  database: muiIcon(StorageIcon, '#6366f1'),
  font: muiIcon(FontDownloadIcon, '#7c3aed'),
  model3d: muiIcon(ViewInArIcon, '#0d9488'),
  config: muiIcon(SettingsSuggestIcon, '#64748b'),
  email: muiIcon(EmailIcon, '#0284c7'),
  calendar: muiIcon(CalendarMonthIcon, '#2563eb'),
  ebook: muiIcon(MenuBookIcon, '#a16207'),
  word: reactIcon(FaFileWord, '#2563eb'),
  excel: reactIcon(FaFileExcel, '#15803d'),
  powerpoint: reactIcon(FaFilePowerpoint, '#c2410c'),
  javascript: reactIcon(SiJavascript, '#ca8a04'),
  typescript: reactIcon(SiTypescript, '#3178c6'),
  react: reactIcon(SiReact, '#0891b2'),
  python: reactIcon(SiPython, '#3776ab'),
  jupyter: reactIcon(SiJupyter, '#f37626'),
  html: reactIcon(SiHtml5, '#e34f26'),
  css: reactIcon(SiCss, '#1572b6'),
  sass: reactIcon(SiSass, '#cc6699'),
  less: reactIcon(SiLess, '#1d365d'),
  markdown: reactIcon(SiMarkdown, '#475569'),
  yaml: reactIcon(BsFiletypeYml, '#cb171e'),
  c: reactIcon(SiC, '#64748b'),
  cpp: reactIcon(SiCplusplus, '#00599c'),
  csharp: reactIcon(SiSharp, '#512bd4'),
  java: reactIcon(FaJava, '#b07219'),
  rust: reactIcon(FaRust, '#92400e'),
  go: reactIcon(SiGo, '#00add8'),
  ruby: reactIcon(SiRuby, '#cc342d'),
  php: reactIcon(SiPhp, '#777bb4'),
  swift: reactIcon(SiSwift, '#f05138'),
  kotlin: reactIcon(SiKotlin, '#7f52ff'),
  scala: reactIcon(SiScala, '#dc322f'),
  lua: reactIcon(SiLua, '#2c2d72'),
  r: reactIcon(SiR, '#276dc3'),
  dart: reactIcon(SiDart, '#0175c2'),
  perl: reactIcon(SiPerl, '#39457e'),
  elixir: reactIcon(SiElixir, '#4b275f'),
  erlang: reactIcon(SiErlang, '#a90533'),
  haskell: reactIcon(SiHaskell, '#5d4f85'),
  julia: reactIcon(SiJulia, '#9558b2'),
  vue: reactIcon(SiVuedotjs, '#42b883'),
  svelte: reactIcon(SiSvelte, '#ff3e00'),
  bash: reactIcon(SiGnubash, '#4eaa25'),
  docker: reactIcon(SiDocker, '#2496ed'),
  terraform: reactIcon(SiTerraform, '#844fba'),
  graphql: reactIcon(SiGraphql, '#e10098'),
  latex: reactIcon(SiLatex, '#008080'),
} as const;

const extensionGroups: ReadonlyArray<
  readonly [readonly string[], FileIconDefinition]
> = [
  [
    [
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp',
      'svg',
      'bmp',
      'tif',
      'tiff',
      'ico',
      'heic',
      'avif',
      'raw',
      'psd',
    ],
    icons.image,
  ],
  [['pdf'], icons.pdf],
  [['doc', 'docx', 'docm', 'dot', 'dotx', 'odt', 'pages'], icons.word],
  [['xls', 'xlsx', 'xlsm', 'ods', 'numbers'], icons.excel],
  [['csv', 'tsv'], icons.table],
  [['ppt', 'pptx', 'pptm', 'odp', 'key'], icons.powerpoint],
  [['txt', 'rtf', 'log', 'readme', 'nfo'], icons.text],
  [['md', 'mdx', 'markdown'], icons.markdown],
  [['js', 'mjs', 'cjs'], icons.javascript],
  [['ts', 'mts', 'cts'], icons.typescript],
  [['jsx', 'tsx'], icons.react],
  [['py', 'pyw', 'pyc', 'pyd'], icons.python],
  [['ipynb'], icons.jupyter],
  [['html', 'htm', 'xhtml'], icons.html],
  [['css'], icons.css],
  [['scss', 'sass'], icons.sass],
  [['less'], icons.less],
  [['json', 'jsonl', 'geojson'], icons.data],
  [['yaml', 'yml'], icons.yaml],
  [['xml', 'xsd', 'xsl', 'xslt'], icons.code],
  [['c'], icons.c],
  [['cc', 'cpp', 'cxx', 'h', 'hh', 'hpp', 'hxx'], icons.cpp],
  [['cs'], icons.csharp],
  [['go'], icons.go],
  [['rb', 'erb'], icons.ruby],
  [['php'], icons.php],
  [['swift'], icons.swift],
  [['kt', 'kts'], icons.kotlin],
  [['scala', 'sc'], icons.scala],
  [['lua'], icons.lua],
  [['r', 'rmd'], icons.r],
  [['rs'], icons.rust],
  [['dart'], icons.dart],
  [['pl', 'pm'], icons.perl],
  [['ex', 'exs'], icons.elixir],
  [['erl', 'hrl'], icons.erlang],
  [['hs', 'lhs'], icons.haskell],
  [['jl'], icons.julia],
  [['vue'], icons.vue],
  [['svelte'], icons.svelte],
  [['sh', 'bash', 'zsh', 'fish'], icons.bash],
  [['ps1', 'bat', 'cmd'], icons.shell],
  [['java', 'class', 'jar'], icons.java],
  [['groovy', 'gradle'], icons.code],
  [['sql', 'db', 'sqlite', 'sqlite3', 'mdb', 'accdb'], icons.database],
  [['graphql', 'gql'], icons.graphql],
  [['tex', 'sty', 'cls', 'bib'], icons.latex],
  [['tf', 'tfvars'], icons.terraform],
  [['dockerfile'], icons.docker],
  [
    ['zip', 'tar', 'gz', 'tgz', 'bz', 'bz2', 'xz', 'rar', '7z', 'zst'],
    icons.archive,
  ],
  [['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'aiff'], icons.audio],
  [
    ['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'wmv', 'mpeg', 'mpg'],
    icons.video,
  ],
  [['ttf', 'otf', 'woff', 'woff2', 'eot'], icons.font],
  [['epub', 'mobi', 'azw', 'azw3'], icons.ebook],
  [['eml', 'msg', 'mbox'], icons.email],
  [['ics', 'ical'], icons.calendar],
  [
    [
      'parquet',
      'avro',
      'orc',
      'arrow',
      'feather',
      'h5',
      'hdf5',
      'nc',
      'mat',
      'npy',
      'npz',
      'sav',
    ],
    icons.database,
  ],
  [
    ['vtk', 'vtu', 'vtp', 'stl', 'obj', 'ply', 'gltf', 'glb', 'fbx', 'dae'],
    icons.model3d,
  ],
  [
    ['toml', 'ini', 'cfg', 'conf', 'config', 'env', 'properties', 'lock'],
    icons.config,
  ],
  [
    ['exe', 'dll', 'so', 'dylib', 'bin', 'iso', 'dmg', 'deb', 'rpm'],
    icons.generic,
  ],
];

export const FILE_EXTENSION_ICON_MAP: Readonly<
  Record<string, FileIconDefinition>
> = Object.freeze(
  Object.fromEntries(
    extensionGroups.flatMap(([extensions, definition]) =>
      extensions.map((extension) => [extension, definition])
    )
  )
);

const normalizeExtension = (extension?: string) =>
  extension?.trim().toLowerCase().replace(/^\.+/, '').split('.').pop() || '';

export function getFileIconDefinition(
  extension?: string,
  mimeType?: string
): FileIconDefinition {
  const mapped = FILE_EXTENSION_ICON_MAP[normalizeExtension(extension)];
  if (mapped) return mapped;

  const mime = mimeType?.toLowerCase() || '';
  if (mime.startsWith('image/')) return icons.image;
  if (mime.startsWith('audio/')) return icons.audio;
  if (mime.startsWith('video/')) return icons.video;
  if (mime === 'application/pdf') return icons.pdf;
  if (mime.includes('spreadsheet') || mime.includes('excel'))
    return icons.excel;
  if (mime.includes('presentation') || mime.includes('powerpoint')) {
    return icons.presentation;
  }
  if (mime.includes('wordprocessing') || mime.includes('msword')) {
    return icons.word;
  }
  if (mime.includes('zip') || mime.includes('compressed')) return icons.archive;
  if (mime.includes('json')) return icons.data;
  if (mime.startsWith('text/')) return icons.text;
  return icons.generic;
}

export function getFileIcon(
  type: 'file' | 'directory',
  extension?: string,
  mimeType?: string,
  size: number | string = 24
) {
  if (type === 'directory') {
    return <FolderIcon sx={{ color: '#f59e0b', fontSize: size }} />;
  }

  const definition = getFileIconDefinition(extension, mimeType);
  const Icon = definition.icon;
  return definition.source === 'mui' ? (
    <Icon sx={{ color: definition.color, fontSize: size }} />
  ) : (
    <Icon
      aria-hidden
      color={definition.color}
      size={size}
      style={{ flexShrink: 0 }}
    />
  );
}

export function resolveActionIcon(iconName: string) {
  switch (iconName) {
    case 'Visibility':
      return <VisibilityIcon fontSize="small" />;
    case 'InfoOutlined':
      return <InfoOutlinedIcon fontSize="small" />;
    case 'Download':
      return <DownloadIcon fontSize="small" />;
    case 'StarBorder':
      return <StarBorderIcon fontSize="small" />;
    case 'Star':
      return <StarIcon fontSize="small" />;
    case 'DriveFileRenameOutline':
      return <DriveFileRenameOutlineIcon fontSize="small" />;
    case 'AutoFixHigh':
      return <AutoFixHighIcon fontSize="small" />;
    case 'ContentCopy':
      return <ContentCopyIcon fontSize="small" />;
    case 'DriveFileMove':
      return <DriveFileMoveIcon fontSize="small" />;
    case 'FileCopy':
      return <FileCopyIcon fontSize="small" />;
    case 'LabelOutlined':
      return <LabelOutlinedIcon fontSize="small" />;
    case 'ShareOutlined':
      return <ShareOutlinedIcon fontSize="small" />;
    case 'FolderZipOutlined':
      return <FolderZipOutlinedIcon fontSize="small" />;
    case 'UnarchiveOutlined':
      return <UnarchiveOutlinedIcon fontSize="small" />;
    case 'Fingerprint':
      return <FingerprintIcon fontSize="small" />;
    case 'LockOutlined':
      return <LockOutlinedIcon fontSize="small" />;
    case 'DeleteOutline':
    case 'Delete':
      return <DeleteIcon fontSize="small" />;
    case 'BookmarkAddOutlined':
      return <BookmarkAddOutlinedIcon fontSize="small" />;
    case 'DataObject':
      return <DataObjectIcon fontSize="small" />;
    case 'CloudSyncOutlined':
      return <CloudSyncOutlinedIcon fontSize="small" />;
    case 'AnalyticsOutlined':
      return <AnalyticsOutlinedIcon fontSize="small" />;
    case 'Webhook':
      return <WebhookIcon fontSize="small" />;
    case 'Transform':
      return <TransformIcon fontSize="small" />;
    case 'Security':
      return <SecurityIcon fontSize="small" />;
    case 'Brush':
      return <BrushIcon fontSize="small" />;
    case 'Extension':
    default:
      return <ExtensionIcon fontSize="small" />;
  }
}

export const AVAILABLE_ACTION_ICONS = [
  { id: 'Extension', label: 'Plugin / Extension' },
  { id: 'Webhook', label: 'Webhook' },
  { id: 'Transform', label: 'Transform / Convert' },
  { id: 'AnalyticsOutlined', label: 'Analytics / Stats' },
  { id: 'BookmarkAddOutlined', label: 'Tagger / Bookmark' },
  { id: 'DataObject', label: 'Data / JSON' },
  { id: 'CloudSyncOutlined', label: 'Cloud Sync' },
  { id: 'Security', label: 'Security / Encrypt' },
  { id: 'AutoFixHigh', label: 'Magic / Automate' },
  { id: 'Brush', label: 'Design / Styling' },
  { id: 'Fingerprint', label: 'Checksum / Identity' },
];
