import React, { useContext } from 'react';
import { PageContext } from '../components/providers/PageProvider.jsx';

const usePageProvider = () => useContext(PageContext);

export default usePageProvider;
