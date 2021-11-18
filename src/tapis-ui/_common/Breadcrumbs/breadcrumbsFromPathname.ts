import { BreadcrumbType } from 'tapis-ui/_common/Breadcrumbs/Breadcrumbs';
import { normalize } from 'path';

const breadcrumbsFromPathname = (pathname: string) => {
  const items: Array<BreadcrumbType> = [];
  const pathParts = pathname.split('/');
  pathParts.forEach((_, index) => {
    let to = normalize('/' + pathParts.slice(0, index + 1).join('/') + '/');
    if (pathParts[index].length) {
      items.push({ to, text: pathParts[index] });
    }
  });
  return items;
};

export default breadcrumbsFromPathname;
