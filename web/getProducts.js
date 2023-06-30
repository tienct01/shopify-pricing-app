import shopify from './shopify.js';

const QUERY_PRODUCT = `
  query getProducts($query: String){
    products(first: 100, query: $query) {
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
`;

const getProducts = async (session, tags) => {
	try {
		let queryParam = '';
		if (tags) {
			tags.forEach((tag, index) => {
				if (index === tags.length - 1) {
					queryParam += `tag:${tag}`;
				} else {
					queryParam += `tag:${tag} OR `;
				}
			});
		}
		const client = new shopify.api.clients.Graphql({ session: session });
		const productResponse = await client.query({
			data: {
				query: QUERY_PRODUCT,
				variables: {
					query: queryParam,
				},
			},
		});

		return productResponse.body?.data.products.edges;
	} catch (error) {
		throw error.message;
	}
};
export default getProducts;
