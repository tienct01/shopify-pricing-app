import { Box } from '@shopify/polaris';
import React from 'react';
import styles from './PriceTable.module.css';

const PriceTable = ({ tbody }) => {
	return (
		<Box>
			<table className={styles.table}>
				<thead>
					<tr>
						<th className={styles.headingTitle}>Title</th>
						<th className={styles.headingPrice}>Modified Price</th>
					</tr>
				</thead>
				<tbody>{tbody}</tbody>
			</table>
		</Box>
	);
};

export default PriceTable;
