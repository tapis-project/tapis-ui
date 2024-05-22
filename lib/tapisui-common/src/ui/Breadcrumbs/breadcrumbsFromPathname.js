import { normalize } from 'path';
var breadcrumbsFromPathname = function (pathname) {
    var items = [];
    var pathParts = pathname.split('/');
    pathParts.forEach(function (_, index) {
        var to = normalize('/' + pathParts.slice(0, index + 1).join('/') + '/');
        if (pathParts[index].length) {
            items.push({ to: to, text: pathParts[index] });
        }
    });
    return items;
};
export default breadcrumbsFromPathname;
