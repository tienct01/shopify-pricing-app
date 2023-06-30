import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getDataFromLocalStorage, saveDataToLocalStorage } from '../../helpers/localStorageHelper.js';
import KEYS from '../../constants/keys.js';

export const PageContext = createContext({});

const PageProvider = ({ children }) => {
	const [rules, setRules] = useState([]);

	const saveRules = useCallback(
		(newRuleData) => {
			const index = rules.findIndex((rule) => rule.id === newRuleData.id);
			if (index === -1) {
				let newRules = [...rules, newRuleData];
				setRules(newRules);
				saveDataToLocalStorage(KEYS.RULES, newRules);
			} else {
				let newRules = [...rules];
				newRules[index] = newRuleData;
				setRules(newRules);
				saveDataToLocalStorage(KEYS.RULES, newRules);
			}
		},
		[rules]
	);

	const removeRules = useCallback(
		(ids) => {
			let newRules = rules.filter((rule) => {
				return !ids.includes(rule.id);
			});
			setRules(newRules);
			saveDataToLocalStorage(KEYS.RULES, newRules);
		},
		[rules]
	);

	const getRuleById = useCallback(
		(id) => {
			return rules.find((rule) => rule.id === id);
		},
		[rules]
	);
	useEffect(() => {
		const dataFromLocalStorage = getDataFromLocalStorage(KEYS.RULES);
		if (dataFromLocalStorage) {
			setRules(dataFromLocalStorage);
		}
	}, []);
	const value = {
		rules,
		saveRules,
		removeRules,
		getRuleById,
	};
	return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export default PageProvider;
