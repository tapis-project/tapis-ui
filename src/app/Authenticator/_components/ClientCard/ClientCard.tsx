import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardText,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Icon } from '@tapis/tapisui-common';
import styles from './ClientCard.module.scss';


type ClientProps = {
  callback_url: string;
  client_id: string;
  description: string;
  version: string;
  display_name: string;
};

const ClientCard: React.FC<ClientProps> = ({
  callback_url,
  client_id,
  description,

}) => {
  return (
    <Card className="styles.card">
      <CardHeader>
        <div className={styles['card-header']}>{client_id}</div>
      </CardHeader>
      <CardBody>
          <CardText>
          <div className={styles['description']}>Description:</div>
            {description}
          </CardText>
      </CardBody>
      <CardFooter>
        <Link to={callback_url}> Go to {callback_url} </Link>
        {/* <Icon name="push-right" /> */}
      </CardFooter>
    </Card>
  );
};

export default ClientCard;
