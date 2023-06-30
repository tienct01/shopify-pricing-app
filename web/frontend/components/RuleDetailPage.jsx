import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useToggle from '../hooks/useToggle.js';
import { useAppQuery } from '../hooks/useAppQuery.js';
import { useField, useForm } from '@shopify/react-form';
import {
	AlphaCard,
	Button,
	ChoiceList,
	Combobox,
	EmptyState,
	Form,
	FormLayout,
	HorizontalStack,
	Icon,
	Layout,
	Listbox,
	PageActions,
	Pagination,
	Select,
	Tag,
	Text,
	TextField,
	VerticalStack,
} from '@shopify/polaris';
import { ContextualSaveBar, ResourcePicker, useContextualSaveBar, useNavigate } from '@shopify/app-bridge-react';
import ResourceRow from './ResourceRow/ResourceRow.jsx';
import PriceTable from './PriceTable/PriceTable.jsx';
import { useTranslation } from 'react-i18next';
import { SearchMajor } from '@shopify/polaris-icons';

const RuleDetailPage = ({ onSubmit, ruleData, edit }) => {
	const { t } = useTranslation();
	const { open, toggle } = useToggle();
	const [search, setSearch] = useState('');
	const [selectedProducts, setSelectedProducts] = useState([]);
	const [selectedCollections, setSelectedCollections] = useState([]);
	const [finalData, setFinalData] = useState(ruleData);
	const navigate = useNavigate();
	const { hide } = useContextualSaveBar();

	const { data: tagData } = useAppQuery({ url: '/api/productTags' });
	const tags = useMemo(() => {
		return tagData
			? tagData.tags.map((tag) => {
					return { value: tag, label: tag };
			  })
			: [];
	}, [tagData]);

	const [tagOptions, setTagOptions] = useState(tags);
	const [selectedTags, setSelectedTags] = useState([]);

	// Paginate
	const [page, setPage] = useState(1);
	const paginatedData = useMemo(() => finalData && finalData?.products.slice((page - 1) * 5, (page - 1) * 5 + 5), [page, finalData]);
	// Call api
	const {
		data: allProducts = {},
		refetch: refetchAllProducts,
		isFetching: isFetchingAll,
	} = useAppQuery({
		url: `/api/products`,
		reactQueryOptions: {
			enabled: false,
		},
	});
	const {
		data: productsByTag = {},
		refetch: refetchProductByTag,
		isFetching: isFetchingByTag,
	} = useAppQuery({
		url: `/api/products/byTags?${new URLSearchParams([...selectedTags.map((tag) => ['tags[]', tag])])}`,
		reactQueryOptions: {
			enabled: false,
		},
	});
	const {
		data: productsByCollection = {},
		refetch: refetchProductByCollection,
		isFetching: isFetchingByCollection,
	} = useAppQuery({
		url: `/api/products/byCollections?${new URLSearchParams([...selectedCollections.map((collection) => ['collections[]', collection.id])])}`,
		reactQueryOptions: {
			enabled: false,
		},
	});

	// Min price
	const minPriceAllProduct = useMemo(() => {
		let min = allProducts?.data?.reduce((prev, curProduct) => {
			let parsedPrice = parseInt(curProduct.node.priceRangeV2.minVariantPrice.amount);
			if (prev > parsedPrice) {
				prev = parsedPrice;
			}
			return prev;
		}, parseInt(allProducts?.data?.[0]?.node.priceRangeV2.minVariantPrice.amount));
		return min;
	}, [allProducts]);

	const minPriceProductByTags = useMemo(() => {
		let min = productsByTag?.data?.reduce((prev, curProduct) => {
			let parsedPrice = parseInt(curProduct.node.priceRangeV2.minVariantPrice.amount);
			if (prev > parsedPrice) {
				prev = parsedPrice;
			}
			return prev;
		}, parseInt(productsByTag?.data?.[0]?.node.priceRangeV2.minVariantPrice.amount));
		return min;
	}, [productsByTag]);

	const minPriceProducts = useMemo(() => {
		let min = selectedProducts.reduce((prev, curProduct) => {
			let parsedPrice = parseInt(curProduct.priceRangeV2.minVariantPrice.amount);
			if (prev > parsedPrice) {
				prev = parsedPrice;
			}
			return prev;
		}, parseInt(selectedProducts?.[0]?.priceRangeV2.minVariantPrice.amount));
		return min;
	}, [selectedProducts]);

	const minPriceProductByCollections = useMemo(() => {
		let min = productsByCollection?.data?.reduce((prev, curProduct) => {
			let parsedPrice = parseInt(curProduct.node.priceRangeV2.minVariantPrice.amount);
			if (prev > parsedPrice) {
				prev = parsedPrice;
			}
			return prev;
		}, parseInt(productsByCollection?.data?.[0]?.node.priceRangeV2.minVariantPrice.amount));
		return min;
	}, [productsByCollection]);

	// Validator
	const validators = {
		name: (name) => {
			const trimmed = name.trim();
			if (trimmed === '') {
				return 'Name required';
			}
		},
		priority: (priority) => {
			const parsedNum = parseInt(priority);
			if (isNaN(parsedNum)) {
				return 'Invalid priority number';
			}
			if (parsedNum < 0) {
				return 'Priority number must be greater than 0 and smaller than 99';
			}
			if (parsedNum > 99) {
				return 'Priority number must be greater than 0 and smaller than 99';
			}
		},
		amount: (amount) => {
			const parsedNum = parseInt(amount);
			if (isNaN(parsedNum)) {
				return 'Invalid amount number';
			}
			if (parsedNum < 0) {
				return 'Amount must be positive number';
			}
			if (fields.method.value[0] === 'Percent') {
				if (parsedNum < 0 || parsedNum > 100) {
					return 'Percent must be greater than 0 and smaller than 100';
				}
			} else if (fields.method.value[0] === 'Fixed amount') {
				switch (fields.applyTo.value[0]) {
					case 'all': {
						if (parsedNum > minPriceAllProduct) {
							return 'Amount can not greater than min price';
						}
						break;
					}
					case 'products': {
						if (parsedNum > minPriceProducts) {
							return 'Amount can not greater than min price';
						}
						break;
					}
					case 'collections': {
						if (parsedNum > minPriceProductByCollections) {
							return 'Amount can not be greater than min price';
						}
						break;
					}
					case 'tags': {
						if (parsedNum > minPriceProductByTags) {
							return 'Amount can not be greater than min price';
						}
						break;
					}
				}
			}
		},
	};
	// Form hook
	const methodField = useField(ruleData?.method || ['Fixed price']);
	const applyToField = useField(ruleData?.applyTo || ['all']);
	const { fields, submit, submitting, dirty, validate, submitErrors } = useForm({
		fields: {
			name: useField({
				value: ruleData?.name || '',
				validates: validators.name,
			}),
			priority: useField({
				value: ruleData?.priority || 0,
				validates: validators.priority,
			}),
			status: useField(ruleData?.status || 'Enable'),
			applyTo: applyToField,
			method: methodField,
			amount: useField(
				{
					value: ruleData?.amount || 0,
					validates: validators.amount,
				},
				[methodField.value, applyToField.value, minPriceAllProduct, minPriceProductByCollections, minPriceProductByTags, minPriceProducts]
			),
		},
		onSubmit: (fields) => {
			handleSubmit(fields);
		},
	});

	const handleSubmit = (data) => {
		let finalData = generateFinalData(data);
		setFinalData(finalData);
		hide();
		onSubmit(finalData);
	};

	//Status options
	const statusOptions = useMemo(
		() => [
			{ label: 'Enable', value: 'Enable' },
			{ label: 'Disable', value: 'Disable' },
		],
		[]
	);
	const applyToProductChoices = useMemo(() => [
		{ label: 'All products', value: 'all' },
		{ label: 'Specific products', value: 'products' },
		{ label: 'Product collections', value: 'collections' },
		{ label: 'Product tags', value: 'tags' },
	]);
	const customPriceChoice = useMemo(() => [
		{ label: 'Apply a price to selected products', value: 'Fixed price' },
		{ label: 'Decrease a fixed amount  of the original prices of selected products', value: 'Fixed amount' },
		{ label: 'Decrease the original prices of selected products by a percentage (%)', value: 'Percent' },
	]);

	const getVariantMaxAndMinPrice = (product) => {
		const priceRange = product.variants?.reduce(
			(priceRange, curVariant) => {
				const currentPrice = parseInt(curVariant?.price);
				if (currentPrice > priceRange.maxVariantPrice) {
					priceRange.maxVariantPrice.amount = currentPrice;
				}
				if (currentPrice < priceRange.minVariantPrice) {
					priceRange.minVariantPrice.amount = currentPrice;
				}
				return priceRange;
			},
			{
				maxVariantPrice: {
					amount: parseInt(product?.variants[0]?.price),
				},
				minVariantPrice: {
					amount: parseInt(product?.variants[0]?.price),
				},
			}
		);
		return priceRange;
	};
	const generateFinalData = (fields) => {
		const { name, priority, status, applyTo, method, amount } = fields;

		let finalData = {
			id: ruleData?.id || `${Math.floor(Date.now())}`,
			name: name,
			priority: priority,
			status: status,
			applyTo: applyTo,
			method: method,
			amount: amount,
		};
		switch (applyTo[0]) {
			case 'all': {
				finalData = {
					...finalData,
					products: allProducts.data?.map((product) => {
						return {
							...product.node,
							modifiedPrice: handlePrice(method[0], amount, product.node?.priceRangeV2?.minVariantPrice.amount),
						};
					}),
				};
				break;
			}
			case 'products': {
				finalData = {
					...finalData,
					products: selectedProducts.map((product) => {
						return {
							id: product.id,
							title: product.title,
							priceRangeV2: product.priceRangeV2,
							images: product.images,
							modifiedPrice: handlePrice(method[0], amount, product?.priceRangeV2?.minVariantPrice?.amount),
						};
					}),
				};
				break;
			}
			case 'collections': {
				finalData = {
					...finalData,
					products: productsByCollection.data?.map((product) => {
						return {
							...product.node,
							modifiedPrice: handlePrice(method[0], amount, product.node?.priceRangeV2?.minVariantPrice.amount),
						};
					}),
					collections: selectedCollections,
				};
				break;
			}
			case 'tags': {
				finalData = {
					...finalData,
					products: productsByTag.data?.map((product) => {
						return {
							...product.node,
							modifiedPrice: handlePrice(method[0], amount, product.node?.priceRangeV2?.minVariantPrice.amount),
						};
					}),
					tags: selectedTags,
				};
				break;
			}
		}
		return finalData;
	};

	const handlePrice = (method, amount, price) => {
		switch (method) {
			case 'Fixed price': {
				return `${amount}<u>đ</u>`;
			}
			case 'Fixed amount': {
				let modPrice = price - amount;
				if (modPrice < 0) modPrice = 0;

				return `${modPrice}<u>đ</u> (<s>${price}đ</s>)`;
			}
			case 'Percent': {
				return `${((price / 100) * (100 - amount)).toFixed(2)}<u>đ</u> (<s>${price}đ</s>)`;
			}
		}
	};

	//Combobox handle function
	const updateText = useCallback(
		(value) => {
			setSearch(value);
			value = value.trim();

			if (value === '') {
				setTagOptions(tags);
				return;
			}

			const filterRegex = new RegExp(value, 'i');
			const resultOptions = tags.filter((option) => option.label.match(filterRegex));
			setTagOptions(resultOptions);
		},
		[tags]
	);

	const updateSelection = useCallback(
		(selected) => {
			if (selectedTags.includes(selected)) {
				setSelectedTags(selectedTags.filter((option) => option !== selected));
			} else {
				setSelectedTags([...selectedTags, selected]);
			}

			updateText('');
		},
		[selectedTags, updateText]
	);

	const optionsMarkup = useMemo(() => {
		return tagOptions.length > 0
			? tagOptions.map((option) => {
					const { label, value } = option;

					return (
						<Listbox.Option
							key={`${value}`}
							value={value}
							selected={selectedTags.includes(value)}
							accessibilityLabel={label}
						>
							{label}
						</Listbox.Option>
					);
			  })
			: null;
	}, [selectedTags, tagOptions]);

	//Handle delete function
	const handleDeleteSelectedProduct = (id) => {
		setSelectedProducts([...selectedProducts.filter((product) => product.id !== id)]);
	};

	const handleDeleteSelectedCollection = (id) => {
		setSelectedCollections([...selectedCollections.filter((collection) => collection.id !== id)]);
	};

	const handleDeleteSelectedTag = (id) => {
		setSelectedTags([...selectedTags.filter((tag) => tag !== id)]);
	};

	// Render resourse picker
	const handleSelectProductResPicker = (products) => {
		toggle();
		const listProduct = products?.map((product) => {
			const priceRange = getVariantMaxAndMinPrice(product);
			return {
				id: product.id,
				title: product.title,
				images: product.images,
				priceRangeV2: priceRange,
			};
		});
		setSelectedProducts([...selectedProducts, ...listProduct]);
	};
	const renderProductPicker = () => {
		if (fields.applyTo.value.includes('products')) {
			return (
				<>
					<TextField
						prefix={
							<Icon
								source={SearchMajor}
								color="base"
							/>
						}
						placeholder={'Search products'}
						connectedRight={<Button onClick={toggle}>Browse</Button>}
						onFocus={() => {
							toggle();
						}}
					/>
					<ResourcePicker
						open={open}
						onCancel={toggle}
						resourceType="Product"
						selectMultiple
						initialQuery={search}
						onSelection={(payload) => handleSelectProductResPicker(payload.selection)}
						initialSelectionIds={selectedProducts.map((product) => {
							return { id: product.id };
						})}
						showVariants={false}
					/>
					<VerticalStack>
						{selectedProducts.map((product) => {
							const { title, images } = product;
							return (
								<ResourceRow
									key={product.id}
									name={title}
									source={images?.[0] && images[0]?.originalSrc}
									onDelete={() => handleDeleteSelectedProduct(product.id)}
								/>
							);
						})}
					</VerticalStack>
				</>
			);
		}
		if (fields.applyTo.value.includes('collections')) {
			return (
				<>
					<TextField
						prefix={
							<Icon
								source={SearchMajor}
								color="base"
							/>
						}
						placeholder={'Search collections'}
						connectedRight={<Button onClick={toggle}>Browse</Button>}
						onFocus={() => {
							toggle();
						}}
					/>
					<ResourcePicker
						open={open}
						onCancel={toggle}
						selectMultiple
						resourceType="Collection"
						initialQuery={search}
						onSelection={(payload) => {
							toggle();
							setSelectedCollections(payload.selection);
						}}
						initialSelectionIds={selectedCollections.map((collection) => {
							return { id: collection.id };
						})}
					/>
					<VerticalStack>
						{selectedCollections.map((collection) => {
							const { title, image } = collection;
							return (
								<ResourceRow
									key={collection.id}
									name={title}
									source={image?.originalSrc}
									onDelete={() => handleDeleteSelectedCollection(collection.id)}
								/>
							);
						})}
					</VerticalStack>
				</>
			);
		}
		if (fields.applyTo.value.includes('tags')) {
			return (
				<>
					<Combobox
						allowMultiple
						activator={
							<Combobox.TextField
								prefix={
									<Icon
										source={SearchMajor}
										color="base"
									/>
								}
								value={search}
								onChange={updateText}
								placeholder="Search tags"
								autoComplete="off"
							/>
						}
					>
						{optionsMarkup ? <Listbox onSelect={updateSelection}>{optionsMarkup}</Listbox> : null}
					</Combobox>
					<div
						style={{
							marginTop: '10px',
						}}
					>
						<HorizontalStack gap={'2'}>
							{selectedTags.map((tag) => {
								return (
									<Tag
										key={tag}
										onRemove={() => handleDeleteSelectedTag(tag)}
									>
										{tag}
									</Tag>
								);
							})}
						</HorizontalStack>
					</div>
				</>
			);
		}
		return null;
	};

	useEffect(() => {
		setTagOptions(tags);
	}, [tags]);

	// Refetch product when selected change
	useEffect(() => {
		refetchProductByTag();
	}, [selectedTags]);
	useEffect(() => {
		refetchAllProducts();
	}, []);
	useEffect(() => {
		refetchProductByCollection();
	}, [selectedCollections]);

	useEffect(() => {
		setFinalData(ruleData);
		if (ruleData) {
			switch (ruleData.applyTo[0]) {
				case 'products': {
					setSelectedProducts(ruleData?.products);
					break;
				}
				case 'collections': {
					setSelectedCollections(ruleData?.collections);
					break;
				}
				case 'tags': {
					setSelectedTags(ruleData?.tags);
					break;
				}
				default: {
					break;
				}
			}
		}
	}, [ruleData]);
	useEffect(() => {
		fields.amount.runValidation(fields.amount.value);
	}, [fields.method.value]);

	return (
		<>
			<ContextualSaveBar
				saveAction={{
					onAction: submit,
					disabled: submitting || isFetchingAll || isFetchingByCollection || isFetchingByTag,
					loading: submitting || isFetchingAll || isFetchingByCollection || isFetchingByTag,
				}}
				visible={dirty}
				discardAction={{
					onAction: () => navigate('/'),
					loading: submitting,
					disabled: submitting,
					discardConfirmationModal: true,
				}}
				// leaveConfirmationDisable={true}
				fullWidth
			/>
			<Form>
				<Layout>
					<Layout.Section>
						<VerticalStack gap={'5'}>
							<AlphaCard>
								<FormLayout>
									<Text
										variant="headingLg"
										as="h5"
									>
										{t('HomePage.generalInfo')}
									</Text>
									<TextField
										label="Name"
										{...fields.name}
										placeholder="Your pricing rule"
									/>
									<TextField
										type="number"
										label="Priority"
										helpText="Please enter an integer from 0 to 99.0 is the highest priority"
										{...fields.priority}
									/>
									<Select
										label="Status"
										options={statusOptions}
										{...fields.status}
									/>
								</FormLayout>
							</AlphaCard>
							<AlphaCard>
								<FormLayout>
									<Text
										variant="headingLg"
										as="h5"
									>
										{t('HomePage.applyToProduct')}
									</Text>
									<ChoiceList
										titleHidden
										choices={applyToProductChoices}
										selected={fields.applyTo.value}
										{...fields.applyTo}
										// onChange={(selected) => handleChangeForm(fields.applyTo.onChange(selected))}
									/>
									{renderProductPicker()}
								</FormLayout>
							</AlphaCard>
							<AlphaCard>
								<FormLayout>
									<Text
										variant="headingLg"
										as="h5"
									>
										{t('HomePage.customPrice')}
									</Text>
									<ChoiceList
										titleHidden
										choices={customPriceChoice}
										selected={fields.method.value}
										{...fields.method}
									/>
									<TextField
										label="Amount"
										type="number"
										{...fields.amount}
									/>
								</FormLayout>
							</AlphaCard>
						</VerticalStack>
					</Layout.Section>

					<Layout.Section secondary>
						<AlphaCard padding={'0'}>
							{finalData ? (
								<>
									<PriceTable
										tbody={
											<>
												{finalData &&
													paginatedData?.map((product) => {
														return (
															<tr key={product.id}>
																<td>{product?.title}</td>
																<td
																	dangerouslySetInnerHTML={{
																		__html: product?.modifiedPrice,
																	}}
																></td>
															</tr>
														);
													})}
											</>
										}
									/>
									<div
										style={{
											display: 'flex',
											justifyContent: 'center',
											alignContent: 'center',
											paddingTop: '15px',
											paddingBottom: '15px',
										}}
									>
										<Pagination
											hasPrevious={page > 1}
											onPrevious={() => {
												setPage(page - 1);
											}}
											hasNext={page < Math.ceil(finalData?.products?.length / 5)}
											onNext={() => {
												setPage(page + 1);
											}}
										/>
									</div>
								</>
							) : (
								<EmptyState
									heading="Create your pricing rule"
									image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
								></EmptyState>
							)}
						</AlphaCard>
					</Layout.Section>
					<Layout.Section>
						<PageActions
							primaryAction={{
								content: t('HomePage.save'),
								onAction: submit,
								disabled: submitting || isFetchingAll || isFetchingByCollection || isFetchingByTag || (!dirty && !edit),
								loading: submitting || isFetchingAll || isFetchingByCollection || isFetchingByTag,
							}}
							secondaryActions={[
								{
									content: t('HomePage.cancel'),
									onAction: () => navigate('/'),
									disabled: submitting,
									loading: submitting,
								},
							]}
						/>
					</Layout.Section>
				</Layout>
			</Form>
		</>
	);
};

export default memo(RuleDetailPage);
