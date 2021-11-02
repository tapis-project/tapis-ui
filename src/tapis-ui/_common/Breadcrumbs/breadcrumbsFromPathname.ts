import { BreadcrumbType } from 'tapis-ui/_common/Breadcrumbs/Breadcrumbs';

const breadcrumbsFromPathname = (pathname: string) => {
  const items: Array<BreadcrumbType> = [];
  const pathParts = pathname.split('/').slice(1, -1);
  pathParts.forEach((_, index) => {
    let to = '/' + pathParts.slice(0, index + 1).join('/') + '/';
    items.push({ to, text: pathParts[index] });
  });

  return items;
};

export default breadcrumbsFromPathname;
