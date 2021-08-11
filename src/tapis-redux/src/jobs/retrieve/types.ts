import { Jobs } from '@tapis/tapis-typescript';
import { ApiCallback } from 'tapis-redux/types';

export type JobRetrieveCallback = ApiCallback<Jobs.RespGetJob>;
