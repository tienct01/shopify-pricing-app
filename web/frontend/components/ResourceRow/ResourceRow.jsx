import { Avatar, Icon } from '@shopify/polaris';
import React from 'react';
import { CancelMajor, ImageMajor } from '@shopify/polaris-icons';

import styles from './ResourceRow.module.css';

const ResourceRow = ({ name, source, onDelete }) => {
	return (
		<div className={styles.wrapper}>
			<div className={styles.image}>{source ? <img src={source} /> : <Icon source={ImageMajor} />}</div>
			<div className={styles.name}>{name}</div>
			<button
				className={styles.delete}
				onClick={() => onDelete()}
			>
				<Icon source={CancelMajor} />
			</button>
		</div>
	);
};

export default ResourceRow;
