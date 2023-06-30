import React, { useState } from 'react';

const useToggle = (initState = false) => {
	const [open, setOpen] = useState(initState);

	const toggle = () => setOpen(!open);
	return {
		open,
		toggle,
	};
};

export default useToggle;
