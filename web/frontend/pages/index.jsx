import { useNavigate } from '@shopify/app-bridge-react';
import { AlphaCard, Box, Button, HorizontalStack, IndexTable, Page, Text, useIndexResourceState } from '@shopify/polaris';
import { useTranslation } from 'react-i18next';
import usePageProvider from '../hooks/usePageProvider.js';

export default function HomePage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { rules, removeRules } = usePageProvider();
	const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(rules);

	const resourceName = {
		singular: 'rule',
		plural: 'rules',
	};

	const promoteBulkAction = [
		{
			content: 'Delete rules',
			onAction: () => {
				removeRules(selectedResources);
				handleSelectionChange('page', false);
			},
		},
	];
	return (
		<Page
			title={'Pricing rules'}
			primaryAction={{
				content: 'Add new rule',
				onAction: () => navigate('/rules/new'),
			}}
		>
			<AlphaCard padding={'0'}>
				<IndexTable
					resourceName={resourceName}
					itemCount={rules.length}
					onSelectionChange={handleSelectionChange}
					headings={[{ title: 'Rule ID' }, { title: 'Name' }, { title: 'Status' }, { title: 'Priority' }, { title: 'Method' }]}
					selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
					promotedBulkActions={promoteBulkAction}
				>
					{rules.map((rule, index) => {
						return (
							<IndexTable.Row
								id={rule.id}
								key={rule.id}
								onClick={() => navigate(`/rules/${rule.id}`)}
								selected={selectedResources.includes(rule.id)}
								position={index}
							>
								<IndexTable.Cell>
									<Text
										variant="bodyMd"
										fontWeight="bold"
										as="span"
									>
										{rule.id}
									</Text>
								</IndexTable.Cell>
								<IndexTable.Cell>{rule.name}</IndexTable.Cell>
								<IndexTable.Cell>{rule.status}</IndexTable.Cell>
								<IndexTable.Cell>{rule.priority}</IndexTable.Cell>
								<IndexTable.Cell>{rule.method}</IndexTable.Cell>
							</IndexTable.Row>
						);
					})}
				</IndexTable>
			</AlphaCard>
			<Box padding={'10'} />
		</Page>
	);
}
