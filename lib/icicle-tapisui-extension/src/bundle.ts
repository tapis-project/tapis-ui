import { bundleTasks } from '@tapis/tapisui-extensions-core';
import { tasks } from './tasks';

bundleTasks(tasks, __dirname + '/gen/');
