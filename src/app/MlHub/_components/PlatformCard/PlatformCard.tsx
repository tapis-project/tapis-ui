import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@tapis/tapisui-common';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardFooter,
  CardText,
  Badge,
} from 'reactstrap';
import styles from './PlatformCard.module.scss';

interface PlatformCardProps {
  platform: {
    platform: string;
    name: string;
    description: string;
    icon: string;
    capabilities: string[];
  };
  link: string;
  isExternal?: boolean;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  link,
  isExternal = false,
}) => {
  return (
    <Card className={styles.card}>
      <CardHeader className={styles['card-header']}>
        <div className={styles['icon-container']}>
          <Icon name={platform.icon} className={styles['platform-icon']} />
        </div>
        <div className={styles['platform-name']}>{platform.name}</div>
      </CardHeader>
      <CardBody className={styles['card-body']}>
        <CardTitle tag="h5" className={styles['card-title']}>
          {platform.name}
        </CardTitle>
        <CardText className={styles['card-description']}>
          {platform.description}
        </CardText>
        <div className={styles['capabilities-section']}>
          <h6 className={styles['capabilities-title']}>Capabilities:</h6>
          <div className={styles['capabilities-list']}>
            {platform.capabilities.map((capability, index) => (
              <Badge
                key={index}
                color="info"
                className={styles['capability-badge']}
                // Future: Add onClick handler or wrap in Link component
                // onClick={() => handleCapabilityClick(capability, platform.platform)}
                // as={Link} to={`/ml-hub/platforms/${platform.platform}/capabilities/${capability}`}
              >
                {capability}
              </Badge>
            ))}
          </div>
        </div>
      </CardBody>
      <CardFooter className={styles['card-footer']}>
        {isExternal ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles['platform-link']}
          >
            Browse {platform.name}
          </a>
        ) : (
          <Link to={link} className={styles['platform-link']}>
            Browse {platform.name}
          </Link>
        )}
        <Icon name="push-right" className={styles['arrow-icon']} />
      </CardFooter>
    </Card>
  );
};

export default PlatformCard;
