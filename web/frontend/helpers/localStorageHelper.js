export const saveDataToLocalStorage = (key, data) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(key, JSON.stringify(data));
	}
};

export const getDataFromLocalStorage = (key) => {
	if (typeof localStorage !== 'undefined') {
		const rawData = localStorage.getItem(key);
		if (!rawData) {
			return null;
		}
		const parsedData = JSON.parse(rawData);
		if (parsedData) {
			return parsedData;
		}
		return null;
	}
	return null;
};
