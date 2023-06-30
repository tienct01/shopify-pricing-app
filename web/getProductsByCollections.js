import shopify from './shopify.js';

const QUERY_PRODUCTS_BY_COLLECTION = `
  query getCollection($collectionId: ID!){
    collection(id: $collectionId) {
      products(first: 50) {
        edges {
          node {
            id
            title
            priceRangeV2{
              maxVariantPrice{
                amount
              }
              minVariantPrice {
                amount
              }
            }
          }
        }
      } 
    }
  }
`;
const getProductsByCollections = async (session, collectionIds) => {
	try {
		const client = new shopify.api.clients.Graphql({ session });
		let rawData = [];
		for (let i = 0; i < collectionIds.length; i++) {
			let productResponse = await client.query({
				data: {
					query: QUERY_PRODUCTS_BY_COLLECTION,
					variables: {
						collectionId: collectionIds[i],
					},
				},
			});
			rawData.push(...productResponse.body?.data.collection.products.edges);
		}
		rawData = rawData.filter((val1, index1) => {
			return (
				rawData.findIndex((val2) => {
					return val2.node?.id === val1.node?.id;
				}) === index1
			);
		});
		return rawData;
	} catch (error) {
		throw error;
	}
};

export default getProductsByCollections;
