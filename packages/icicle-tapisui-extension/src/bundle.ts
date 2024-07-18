import { bundleTasks } from '@tapis/tapisui-extension-devtools';
import { tasks } from './tasks';

bundleTasks(tasks, __dirname + '/gen/');
