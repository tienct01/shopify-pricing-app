import shopify from './shopify.js';

const QUERY_PRODUCT_TAG = `
  query {
    shop {
      productTags(first: 100) {
        edges{
          node
        }
      }
    }
  }
`;
const getProductTags = async ({ session }) => {
	try {
		const client = new shopify.api.clients.Graphql({ session: session });
		const tagsQueryResponse = await client.query({
			data: QUERY_PRODUCT_TAG,
		});
		const tags = tagsQueryResponse.body?.data.shop.productTags.edges.map((val) => {
			return val.node;
		});

		return tags;
	} catch (error) {
		throw error;
	}
};
export default getProductTags;
