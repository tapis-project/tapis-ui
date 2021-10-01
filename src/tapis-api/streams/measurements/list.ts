import { Streams } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const list = (
  params: Streams.ListMeasurementsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Streams.MeasurementsApi = apiGenerator<Streams.MeasurementsApi>(
    Streams,
    Streams.MeasurementsApi,
    basePath,
    jwt
  );
  return errorDecoder<Streams.RespListMeasurements>(() =>
    api.listMeasurements(params)
  );
};

export default list;
