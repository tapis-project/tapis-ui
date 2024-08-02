import { BreadcrumbType } from '../../ui/Breadcrumbs/Breadcrumbs';
import normalize from 'normalize-path';

const breadcrumbsFromPathname = (pathname: string) => {
  const items: Array<BreadcrumbType> = [];
  if (pathname.startsWith('/pods/images/')) {
    // special case - images urls can have slashes in them
    const image = pathname.replace('/pods/images/', '');
    console.log(image);
    items.push({ to: normalize('/pods/'), text: 'pods' });
    items.push({ to: normalize('/pods/images/'), text: 'images' });
    if (image) {
      items.push({ to: normalize(`/pods/images/${image}/`), text: image });
    }
  } else if (pathname.startsWith('/ml-hub/datasets/')) {
    // special case for ml-hub/datasets
    const dataset = pathname.replace('/ml-hub/datasets/', '');
    console.log(dataset);
    items.push({ to: normalize('/ml-hub/'), text: 'ml-hub' });
    items.push({ to: normalize('/ml-hub/datasets/'), text: 'datasets' });
    if (dataset) {
      items.push({
        to: normalize(`/ml-hub/datasets/${dataset}/`),
        text: dataset,
      });
    }
  } else if (pathname.startsWith('/ml-hub/models/')) {
    // special case for ml-hub/models
    const model = pathname.replace('/ml-hub/models/', '');
    console.log(model);
    items.push({ to: normalize('/ml-hub/'), text: 'ml-hub' });
    items.push({ to: normalize('/ml-hub/models/'), text: 'models' });
    if (model) {
      items.push({
        to: normalize(`/ml-hub/models/${model}/`),
        text: model,
      });
    }
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
