import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {
  TreeItem,
  treeItemClasses,
  TreeItemProps,
} from '@mui/x-tree-view/TreeItem';
import { styled, alpha } from '@mui/material/styles';
import IndeterminateCheckBoxRoundedIcon from '@mui/icons-material/IndeterminateCheckBoxRounded';
import DisabledByDefaultRoundedIcon from '@mui/icons-material/DisabledByDefaultRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import { format } from 'date-fns';
import styles from '../Pages.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { updateState } from '../../redux/podsSlice';
import { RootState } from '../../redux/store';

interface CustomTreeItemProps extends TreeItemProps {
  isLeaf?: boolean;
}

const CustomTreeItem = styled(({ isLeaf, ...other }: CustomTreeItemProps) => (
  <TreeItem {...other} />
))(({ theme, isLeaf }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
    display: isLeaf ? 'none' : 'block', // Hide icon if it's a leaf node
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 16,
    paddingLeft: 3,
    borderLeft: `.5px solid ${alpha(theme.palette.text.primary, 0.12)}`,
  },
}));

function ExpandIcon(props: React.PropsWithoutRef<typeof AddBoxRoundedIcon>) {
  return <AddBoxRoundedIcon {...props} sx={{ opacity: 0.3 }} />;
}

function CollapseIcon(
  props: React.PropsWithoutRef<typeof IndeterminateCheckBoxRoundedIcon>
) {
  return <IndeterminateCheckBoxRoundedIcon {...props} sx={{ opacity: 0.55 }} />;
}

function EndIcon(
  props: React.PropsWithoutRef<typeof DisabledByDefaultRoundedIcon>
) {
  return <DisabledByDefaultRoundedIcon {...props} sx={{ opacity: 0.3 }} />;
}

const NavTemplates: React.FC = () => {
  const { url } = useRouteMatch();
  const { data, isLoading, error } = Hooks.useListTemplatesAndTags({
    full: true,
  });
  const definitions = data?.result || {};
  const loadingText = PodsLoadingText();
  const history = useHistory();
  const dispatch = useDispatch();

  const { templateNavExpandedItems, templateNavSelectedItems } = useSelector(
    (state: RootState) => state.pods
  );

  const handleItemClick = (event: React.MouseEvent, itemId: string) => {
    const parts = itemId.split('-');
    const templateId = parts[0];
    let redirectUrl = `/pods/templates/${templateId}`;

    if (parts.length === 2) {
      redirectUrl += `/tags/${parts[1]}`;
    } else if (parts.length >= 3) {
      const prefix = parts[1];
      const timestamp = parts.slice(2).join('-');
      redirectUrl += `/tags/${prefix}@${timestamp}`;
    }

    history.push(redirectUrl);
  };

  const handleItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string[]
  ) => {
    dispatch(updateState({ templateNavExpandedItems: itemIds }));
  };

  const handleSelectedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string | null
  ) => {
    if (itemIds !== null) {
      dispatch(updateState({ templateNavSelectedItems: itemIds }));
    }
  };

  if (isLoading) {
    return (
      <Navbar>
        <div style={{ paddingLeft: '16px' }}>
          <NavItem icon="visualization">{loadingText}</NavItem>
        </div>
      </Navbar>
    );
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 120) {
      return `${diffInSeconds} secs`;
    } else if (diffInSeconds < 2 * 24 * 60 * 60) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return `${diffInMinutes} mins`;
    } else {
      const diffInDays = Math.floor(diffInSeconds / (24 * 60 * 60));
      return `${diffInDays} days`;
    }
  };

  const items = Object.keys(definitions).map((templateId) => {
    const tags = definitions[templateId].tags || [];
    const groupedTags: { [key: string]: React.ReactNode[] } = {};

    tags.forEach((tag: any) => {
      const [prefix, timestamp] = tag.tag_timestamp.split('@');
      const formattedTimestamp = format(new Date(timestamp), 'yyyy/MM/dd');
      const timeAgo = formatTimeAgo(timestamp);

      if (!groupedTags[prefix]) {
        groupedTags[prefix] = [];
      }
      groupedTags[prefix].push(
        <CustomTreeItem
          key={`${templateId}-${prefix}-${timestamp}`}
          itemId={`${templateId}-${prefix}-${timestamp}`}
          label={`${formattedTimestamp} | ${timeAgo}`}
          isLeaf={true}
        />
      );
    });
    const children = Object.keys(groupedTags).map((prefix) => (
      <CustomTreeItem
        key={`${templateId}-${prefix}`}
        itemId={`${templateId}-${prefix}`}
        label={prefix}
      >
        {groupedTags[prefix]}
      </CustomTreeItem>
    ));

    return (
      <CustomTreeItem key={templateId} itemId={templateId} label={templateId}>
        {children}
      </CustomTreeItem>
    );
  });

  return (
    <Navbar>
      <Box sx={{ minHeight: 200, minWidth: 250 }}>
        <SimpleTreeView
          expandedItems={templateNavExpandedItems}
          onExpandedItemsChange={handleItemsChange}
          selectedItems={templateNavSelectedItems}
          onSelectedItemsChange={handleSelectedItemsChange}
          onItemClick={handleItemClick}
          slots={{
            expandIcon: ExpandIcon,
            collapseIcon: CollapseIcon,
            endIcon: EndIcon,
          }}
        >
          {items}
        </SimpleTreeView>
      </Box>
    </Navbar>
  );
};

export default NavTemplates;
