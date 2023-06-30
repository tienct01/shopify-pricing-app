import { BrowserRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Routes from './Routes';

import { AppBridgeProvider, QueryProvider, PolarisProvider } from './components';
import PageProvider from './components/providers/PageProvider.jsx';

export default function App() {
	// Any .tsx or .jsx files in /pages will become a route
	// See documentation for <Routes /> for more info
	const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)');
	const { t } = useTranslation();
	return (
		<PolarisProvider>
			<BrowserRouter>
				<AppBridgeProvider>
					<QueryProvider>
						<PageProvider>
							<Routes pages={pages} />
						</PageProvider>
					</QueryProvider>
				</AppBridgeProvider>
			</BrowserRouter>
		</PolarisProvider>
	);
}
