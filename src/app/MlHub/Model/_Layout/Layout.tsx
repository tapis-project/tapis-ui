import * as Models from '@mlhub/models-ts-sdk';
import { QueryWrapper } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import Model from '../Model';

type ModelDetailsLayoutProps = {
  author: string;
  name: string;
  scope: 'global' | 'tenant' | 'me';
};

const Layout: React.FC<ModelDetailsLayoutProps> = ({ author, name, scope }) => {
  const { data, isLoading, error } = Hooks.Models.useGetModel({
    author,
    name,
    scope: (['tenant', 'me'].includes(scope)
      ? 'tenant'
      : 'global') as Models.GetModelByAuthorAndNameScopeEnum,
  });

  const model = data?.result ?? undefined;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {model === undefined && <b>404 Model Not Found</b>}
      {model && <Model model={model} scope={scope} />}
    </QueryWrapper>
  );
};

export default Layout;
