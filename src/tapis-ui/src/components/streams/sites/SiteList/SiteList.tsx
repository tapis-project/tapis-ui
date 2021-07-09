import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Site } from "@tapis/tapis-typescript-streams";
import { useSites } from 'tapis-redux';
import { SitesListCallback } from 'tapis-redux/streams/sites/types';
import { Config } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { Icon } from 'tapis-ui/_common';
import "./SiteList.scss";

export type OnSelectCallback = (site: Site) => any;

interface SiteItemProps {
  site: Site,
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
  selected?: Site
}

const SiteList: React.FC<SiteListProps> = ({ projectId, config, onList, onSelect, selected }) => {
  const dispatch = useDispatch();
  const { sites, list } = useSites(config);
  useEffect(() => {
    dispatch(list({ 
      onList, 
      request: {
        projectUuid: projectId
      }
    }));
  }, [dispatch]);
  const definitions: Array<Site> = sites.results;
  const select = useCallback((site: Site) => {
    if(onSelect) {
      onSelect(site);
    }
  },[onSelect]);

  if (sites.loading) {
    return <LoadingSpinner/>
  }

  return (
    <div className="site-list nav flex-column">
      {
        definitions.length
          ? definitions.map(
              (site) => <SiteItem site={site} key={site.site_id} selected={selected? selected.site_id === site.site_id : false} select={select} />
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
