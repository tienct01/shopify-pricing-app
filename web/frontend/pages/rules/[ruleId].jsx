import { Page, Text, Box, Badge } from '@shopify/polaris';
import { useTranslation } from 'react-i18next';
import RuleDetailPage from '../../components/RuleDetailPage.jsx';

import { useNavigate, useParams } from 'react-router-dom';
import usePageProvider from '../../hooks/usePageProvider.js';
import { useEffect } from 'react';
import { useToast } from '@shopify/app-bridge-react';

export default function EditRulePage() {
	const { t } = useTranslation();
	const { ruleId } = useParams();
	const { getRuleById, saveRules } = usePageProvider();
	const navigate = useNavigate();
	const ruleData = getRuleById(ruleId);
	const toast = useToast();

	const handleSubmit = (data) => {
		saveRules(data);
		toast.show('Update success');
	};
	const renderTitleMeta = () => {
		return <Badge status={ruleData?.status === 'Enable' ? 'success' : 'info'}>{ruleData.status}</Badge>;
	};
	useEffect(() => {
		if (!getRuleById(ruleId)) {
			navigate('/notfound', {
				replace: true,
			});
		}
	}, [ruleId]);
	if (!getRuleById(ruleId)) {
		return null;
	}
	return (
		<Page
			fullWidth
			title={ruleData?.name}
			titleMetadata={renderTitleMeta()}
			backAction={{
				content: 'Rules',
				url: '/',
			}}
		>
			<RuleDetailPage
				onSubmit={handleSubmit}
				ruleData={ruleData}
				edit={true}
			/>
		</Page>
	);
}
