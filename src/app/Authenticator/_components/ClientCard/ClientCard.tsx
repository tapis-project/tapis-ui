import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    CardFooter,
    CardText,
  } from 'reactstrap';
  import { Link } from 'react-router-dom';
  import { Icon } from '@tapis/tapisui-common';
  import { listClients } from "@tapis/tapisui-api/dist/authenticator";
  import styles from './ClientCard.module.scss';
  

type ClientProps={
    callback_url:string,
    client_id:string,
    description:string,
    owner:string,
    tenant_id:string
};


const ClientCard: React.FC <ClientProps> = ({
    callback_url,
    client_id,
    description,
    owner,
    tenant_id
}) => {
    


    return (
        <Card className="styles.card">
            <CardHeader>
                <div className={styles['card-header']}>
                </div>
            </CardHeader>
                    <CardBody>
                        <CardTitle>
                            <CardText>
                                {description}
                                {owner}
                                {tenant_id}
                            </CardText>
                        </CardTitle>
                    </CardBody>
                    <CardFooter>
                        <Link to={callback_url}> Go to {client_id}
                        </Link>
                        <Icon name="push-right"/>
                    </CardFooter>
        </Card>
    )

};


export default ClientCard;