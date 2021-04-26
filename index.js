import settings from './settings';
import cache from './PlayerCache';


register('command', () => settings.openGUI()).setName('chatbridge');


register('chat', event => {
	if (!settings.enabled) return;

	const chatMessage = ChatLib.getChatMessage(event, true);

	// prettify chat bridge messages
	const bridgeMessageMatched = chatMessage.match(new RegExp(`^&r&2Guild > (?:&[0-9a-gk-or]){0,2}(?:\\[.+?\\] )?${settings.botIGN}(?: &[0-9a-gk-or]\\[[a-zA-Z]{1,5}\\])?&f: &r(\\w+):`));

	if (bridgeMessageMatched) {
		cancel(event);

		// blocked IGNs
		if (settings.enableBlocking && settings.blockedIGNs.includes(bridgeMessageMatched[1].toLowerCase())) return;

		// use TextComponent to preserve onClick and onHover values
		const message = new Message(event);

		message.getMessageParts().forEach((component, index) => {
			console.log(index, component.getText());
		});

		const [ firstComponent, secondComponent ] = message.getMessageParts();

		return message
			.setTextComponent(
				0,
				firstComponent.setText(`${settings.prefixColour}${settings.prefix}§r${cache.get(bridgeMessageMatched[1]) || settings.uncachedPlayerColour + bridgeMessageMatched[1]}§f: `)
			)
			.setTextComponent(
				1,
				secondComponent.setText(secondComponent.getText().split(': ').slice(1).join(': '))
			)
			.chat();
	}

	// add / remove players that joine / leave the guild
	const joinedLeftMessageMatched = chatMessage.match(/^((?:&[0-9a-gk-or]){0,2}(?:\[.+?\] )?\w+) (joined|left) the guild!$/);

	if (joinedLeftMessageMatched) {
		switch (joinedLeftMessageMatched[2]) {
			case 'joined':
				return cache.add(joinedLeftMessageMatched[1]);

			case 'left':
				return cache.remove(joinedLeftMessageMatched[1]);
		}

		return;
	}

	// don't fill cache with randoms from partys
	if (chatMessage.startsWith('&eParty ')) return;

	// parse player displayNames from '/gl'
	const playerListMatched = chatMessage.match(/(?:&[0-9a-gk-or]){0,2}(?:\[.+?\] )?\w+(?=&r&[ac] ●)/g);

	if (playerListMatched) {
		for (let i = playerListMatched.length; i--;) {
			cache.add(playerListMatched[i])
		}

		if (settings.debug) console.log(`[chatBridge]: cached ${cache.size} players`) // debug info
	}
}).triggerIfCanceled(true);


// initial '/gl' parsing
let init = register('worldLoad', () => {
	init.unregister();
	init = undefined;

	if (settings.enabled) setTimeout(() => cache.populate(), 5_000);
});
