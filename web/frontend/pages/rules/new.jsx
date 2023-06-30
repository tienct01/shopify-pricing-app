import { Page, Text, Box } from '@shopify/polaris';
import { useTranslation } from 'react-i18next';
import RuleDetailPage from '../../components/RuleDetailPage.jsx';
import usePageProvider from '../../hooks/usePageProvider.js';
import { useNavigate, useToast } from '@shopify/app-bridge-react';

export default function NewRulePage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { saveRules } = usePageProvider();
	const toast = useToast();

	const handleSubmit = (data) => {
		saveRules(data);
		toast.show('Success');
		navigate(`/rules/${data?.id}`);
	};
	return (
		<Page
			fullWidth
			title={t('HomePage.newRuleTitle')}
			backAction={{
				content: 'Rules',
				url: '/',
			}}
		>
			<RuleDetailPage onSubmit={handleSubmit} />
		</Page>
	);
}
