// @ts-check
import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import serveStatic from 'serve-static';

import shopify from './shopify.js';
import productCreator from './product-creator.js';
import GDPRWebhookHandlers from './gdpr.js';
import getProductTags from './getProductTags.js';
import getProducts from './getProducts.js';
import getProductsByCollections from './getProductsByCollections.js';
import getProductsByTag from './getProductsByTag.js';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '3000', 10);

const STATIC_PATH = process.env.NODE_ENV === 'production' ? `${process.cwd()}/frontend/dist` : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(shopify.config.auth.callbackPath, shopify.auth.callback(), shopify.redirectToShopifyOrAppRoot());
app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers }));

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use('/api/*', shopify.validateAuthenticatedSession());

app.use(express.json());

app.get('/api/products/count', async (_req, res) => {
	const countData = await shopify.api.rest.Product.count({
		session: res.locals.shopify.session,
	});
	res.status(200).send(countData);
});

app.get('/api/products/create', async (_req, res) => {
	let status = 200;
	let error = null;

	try {
		await productCreator(res.locals.shopify.session);
	} catch (e) {
		console.log(`Failed to process products/create: ${e.message}`);
		status = 500;
		error = e.message;
	}
	res.status(status).send({ success: status === 200, error });
});

app.get('/api/productTags', async (_req, res) => {
	try {
		const tags = await getProductTags({ session: res.locals.shopify.session });
		return res.status(200).json({
			tags: tags,
		});
	} catch (error) {
		return res.status(500).json({
			error,
		});
	}
});
app.get('/api/products', async (_req, res) => {
	try {
		const { tags } = _req.query;

		const data = await getProducts(res.locals.shopify.session, tags);

		return res.status(200).json({
			data: data,
		});
	} catch (error) {
		return res.status(500).json({
			error,
		});
	}
});
app.get('/api/products/byTags', async (_req, res) => {
	try {
		const { tags } = _req.query;
		const data = await getProductsByTag(res.locals.shopify.session, tags);

		return res.status(200).json({
			data: data,
		});
	} catch (error) {
		return res.status(500).json({
			error,
		});
	}
});

app.get('/api/products/byCollections', async (_req, res) => {
	try {
		const { collections = [] } = _req.query;
		const data = await getProductsByCollections(res.locals.shopify.session, collections);

		return res.status(200).json({
			data: data,
		});
	} catch (error) {
		return res.status(500).json({
			error,
		});
	}
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
	return res
		.status(200)
		.set('Content-Type', 'text/html')
		.send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.listen(PORT);
