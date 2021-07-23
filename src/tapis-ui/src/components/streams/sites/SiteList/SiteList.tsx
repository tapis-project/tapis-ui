import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Streams } from "@tapis/tapis-typescript";
import { useSites } from 'tapis-redux';
import { SiteList, SitesListCallback, SitesReducerState } from 'tapis-redux/streams/sites/types';
import { Config, TapisState } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { Icon } from 'tapis-ui/_common';
import getSites from "tapis-redux/streams/sites/selectors";
import "./SiteList.scss";

export type OnSelectCallback = (site: Streams.Site) => any;

interface SiteItemProps {
  site: Streams.Site,
  select: Function,
  selected: boolean
}

const SiteItem: React.FC<SiteItemProps> = ({ site, select, selected }) => {
  return (

    <li className="nav-item">
      <div className={"nav-link" + (selected ? ' active' : '')}>
        <div className="nav-content" onClick={() => select(site) }>
          <Icon name="data-files" />
          <span className="nav-text">{`${site.site_name}`}</span>
        </div>
      </div>
    </li>



    // <div onClick={() => onSelect(site)}>
    //   {`${site.site_uuid} (${site.site_name})`}
    // </div>
  );
};

SiteItem.defaultProps = {
  selected: false
}

interface SiteListProps {
  projectId: string,
  config?: Config,
  onList?: SitesListCallback,
  onSelect?: OnSelectCallback,
  selected?: Streams.Site
}

const SiteList: React.FC<SiteListProps> = ({ projectId, config, onList, onSelect, selected }) => {
  const dispatch = useDispatch();
  const { sites, list } = useSites(config);
  console.log(sites);
  
  useEffect(() => {
    //if already have project sites don't re-request
    if(!sites[projectId]) {
      dispatch(list({ 
        onList, 
        request: {
          projectUuid: projectId
        }
      }));
    }
    
  }, [dispatch, projectId]);
  

  // const definitions: Array<Streams.Site> = sites.results;
  const select = useCallback((site: Streams.Site) => {
    if(onSelect) {
      onSelect(site);
    }
  },[onSelect]);

  // Get the file listing for this systemId and path
  const selector = getSites(projectId);
  const result: SiteList = useSelector<TapisState, SiteList>(selector);

  if(!result || result.loading) {
    return <LoadingSpinner/>
  }

  let definitions = result.results;

  return (
    <div className="site-list nav flex-column">
      {
        definitions.length
        ? definitions.map(
            (site: Streams.Site) => <SiteItem site={site} key={site.site_id} selected={selected? selected.site_id === site.site_id : false} select={select} />
          )
        : <i>No sites found</i>
      }
    </div>
  );
};

SiteList.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default SiteList;
