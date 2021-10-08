/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import settings from './settings';
import cache from './PlayerCache';


register('command', () => settings.openGUI()).setName('chatbridge');


register('chat', event => {
	if (!settings.enabled) return;

	const chatMessage = ChatLib.getChatMessage(event, true);

	// content filter
	if (settings.enableContentBlocking && settings.contentFilter.test(chatMessage)) {
		console.log(`[blocked]: ${chatMessage}`);
		return cancel(event);
	}

	// prettify chat bridge messages
	const bridgeMessageMatched = chatMessage.match(new RegExp(`^&r&2Guild > (?:&[0-9a-gk-or]){0,2}(?:\\[.+?\\] )?${settings.botIGN}(?: &[0-9a-gk-or]\\[[a-zA-Z]{1,5}\\])?&f: &r(\\w+):`));

	if (bridgeMessageMatched) {
		cancel(event);

		// blocked IGNs
		if (settings.enableIGNBlocking && settings.blockedIGNs.includes(bridgeMessageMatched[1].toLowerCase())) return;

		// use TextComponent to preserve onClick and onHover values
		const message = new Message(event);
		const [ firstComponent, secondComponent ] = message.getMessageParts();

		return message
			.setTextComponent(
				0,
				firstComponent.setText(`${settings.prefix}§r${cache.get(bridgeMessageMatched[1]) || settings.uncachedPlayerColour + bridgeMessageMatched[1]}${settings.postfix}§r: `),
			)
			.setTextComponent(
				1,
				secondComponent.setText(secondComponent.getText().split(': ').slice(1).join(': ')),
			)
			.chat();
	}


	// add / remove players that join / leave the guild
	const joinedLeftMessageMatched = chatMessage.match(/^((?:&[0-9a-gk-or]){0,2}(?:\[.+?\] )?\w+) (joined|left) the guild!$/);

	if (joinedLeftMessageMatched) return cache[joinedLeftMessageMatched[2] === 'joined' ? 'add' : 'remove'](joinedLeftMessageMatched[1])


	// don't fill cache with players from partys
	if (chatMessage.startsWith('&eParty ')) return;


	// parse player displayNames from '/gl'
	const playerListMatched = chatMessage.match(/(?:&[0-9a-gk-or]){0,2}(?:\[.+?\] )?\w+(?=&r&[ac] ●)/g);

	if (playerListMatched) {
		for (let i = playerListMatched.length; i--;) {
			cache.add(playerListMatched[i])
		}

		if (settings.debug) console.log(`[chatBridge]: cached ${cache.size} players`) // debug info
	}
}).setPriority(OnTrigger.Priority.HIGHEST);


// initial '/gl' parsing
let init = register('worldLoad', () => {
	if (init) init.unregister();
	init = undefined;

	if (settings.enabled && !cache.size) setTimeout(() => cache.populate(), 5_000);
});
