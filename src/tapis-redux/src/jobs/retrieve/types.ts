import { Jobs } from '@tapis/tapis-typescript';
import { ApiCallback } from 'tapis-redux/src/types';

export type JobRetrieveCallback = ApiCallback<Jobs.RespGetJob> | null;
