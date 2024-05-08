import { BreadcrumbType } from 'tapis-ui/_common/Breadcrumbs/Breadcrumbs';
import normalize from 'normalize-path';

const breadcrumbsFromPathname = (pathname: string) => {
  const items: Array<BreadcrumbType> = [];
  const pathParts = pathname.split('/');
  pathParts.forEach((_, index) => {
    const to = normalize(
      '/' + pathParts.slice(0, index + 1).join('/') + '/',
      false
    );
    if (pathParts[index].length) {
      items.push({ to, text: pathParts[index] });
    }
  });
  return items;
};

export default breadcrumbsFromPathname;
