/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
// @ts-check

import settings from './settings';
import cache from './PlayerCache';


register('command', () => settings.openGUI()).setName('chatbridge');


register('chat', event => {
	if (!settings.enabled) return;

	const chatMessage = ChatLib.getChatMessage(event, true);

	// prettify chat bridge messages
	const bridgeMessageMatched = chatMessage.match(new RegExp(`^&r&2Guild > (?:&[0-9a-gk-or]){0,2}(?:\\[.+?\\] )?${settings.botIGN}(?: &[0-9a-gk-or]\\[[a-zA-Z]{1,5}\\])?&f: &r(\\w+):`));
	const paddingMatched = settings.enablePaddingRemover && chatMessage.match(/(?: (?:-{4}|_{4}|\/{4}))+&r$/);

	if (bridgeMessageMatched) {
		cancel(event);

		// blocked IGNs
		if (settings.enableIGNBlocking && settings.blockedIGNs.includes(bridgeMessageMatched[1].toLowerCase())) return;

		// use TextComponent to preserve onClick and onHover values
		const message = new Message(event);
		const components = message.getMessageParts();

		message
			.setTextComponent(
				0,
				components[0].setText(`${settings.prefix}§r${cache.get(bridgeMessageMatched[1]) || settings.uncachedPlayerColour + bridgeMessageMatched[1]}${settings.postfix}§r: `),
			)
			.setTextComponent(
				1,
				components[1].setText(components[1].getText().split(': ', 2)[1]),
			);

		if (paddingMatched) {
			message.setTextComponent(
				components.length - 1,
				components[components.length - 1].getText().slice(0, -paddingMatched[0].length),
			);
		}

		return message.chat();
	}

	if (paddingMatched) {
		cancel(event);

		// use TextComponent to preserve onClick and onHover values
		const message = new Message(event);
		const components = message.getMessageParts();

		return message
			.setTextComponent(
				components.length - 1,
				components[components.length - 1].getText().slice(0, -paddingMatched[0].length),
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
