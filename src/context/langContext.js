import React, { useState } from 'react';
import EngLang from "../lang/en-US.json";
import SpaLang from "../lang/es-ES.json";
import {IntlProvider} from 'react-intl';

const langContext = React.createContext();

const LangProvider = ({children}) => {
	let defaultLocale;
	let defaultMessages;
	const language = localStorage.getItem('lang');

	if(language){
		defaultLocale = language

		if(language === 'es-ES'){
			defaultMessages = SpaLang;
		} else if(language === 'en-US'){
			defaultMessages = EngLang
		} else {
			defaultLocale = 'es-ES'
			defaultMessages = SpaLang
		}
	}

	const [messages, setMessages] = useState(defaultMessages);
	const [locale, setLocale] = useState(defaultLocale);

	const setLanguage = (language) => {
		switch (language){
			case 'es-ES':
				setMessages(SpaLang);
				setLocale('es-ES');
				localStorage.setItem('lang', 'es-ES');
				break;
			case 'en-US':
				setMessages(EngLang);
				setLocale('en-US');
				localStorage.setItem('lang', 'en-US');
				break;
			default:
				setMessages(SpaLang);
				setLocale('es-ES');
				localStorage.setItem('lang', 'es-ES');
		}
	}

	return (
		<langContext.Provider value={{setLanguage: setLanguage}}>
			<IntlProvider locale={locale} messages={messages}>
				{children}
			</IntlProvider>
		</langContext.Provider>
	);
}

export {LangProvider, langContext};