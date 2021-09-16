import { Streams } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const list = (
  params: Streams.ListInstrumentsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Streams.InstrumentsApi = apiGenerator<Streams.InstrumentsApi>(
    Streams,
    Streams.InstrumentsApi,
    basePath,
    jwt
  );
  return errorDecoder<Streams.RespListInstruments>(() => api.listInstruments(params));
};

export default list;
