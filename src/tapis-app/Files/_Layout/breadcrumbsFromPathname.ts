import { BreadcrumbType } from 'tapis-ui/_common/Breadcrumbs/Breadcrumbs';

const breadcrumbFromPathname = (pathname: string) => {
  const items: Array<BreadcrumbType> = [];
  const pathParts = pathname.split('/').slice(1, -1);
  pathParts.map((_, index) => {
    const ds = index === 0 ? '' : '/';
    let to = '/' + pathParts.slice(0, index + 1).join('/') + ds;
    items.push({ to, text: pathParts[index] });
  });
  console.log(items);
  return items;
};

export default breadcrumbFromPathname;
