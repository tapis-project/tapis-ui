import { BreadcrumbType } from '../../ui/Breadcrumbs/Breadcrumbs';
import normalize from 'normalize-path';

const breadcrumbsFromPathname = (pathname: string) => {
  const items: Array<BreadcrumbType> = [];
  if (pathname.startsWith('/pods/images')) {
    // special case - images urls can have slashes in them
    const image = pathname.replace('/pods/images/', '');
    console.log(image);
    items.push({ to: normalize('/pods/'), text: 'pods' });
    items.push({ to: normalize('/pods/images/'), text: 'images' });
    items.push({ to: normalize(`/pods/images/${image}/`), text: image });
  } else {
    // Original logic
    const pathParts = pathname.split('/');
    pathParts.forEach((_, index) => {
      let to = normalize('/' + pathParts.slice(0, index + 1).join('/') + '/');
      if (pathParts[index].length) {
        items.push({ to, text: pathParts[index] });
      }
    });
  }
  return items;
};

export default breadcrumbsFromPathname;
