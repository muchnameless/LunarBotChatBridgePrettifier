const guildPlayers = {};

register('chat', event => {
	const chatMessage = ChatLib.getChatMessage(event, true);

	// prettify chat bridge messages
	const bridgeMessageMatched = chatMessage.match(/^&r&2Guild > (?:&[0-9a-gk-or]){0,2}(?:\[.+?\] )?Lunar_Bot(?:_2)?(?: &[0-9a-gk-or]\[\w+\])?&f: &r(\w+):/);

	if (bridgeMessageMatched) {
		ChatLib.chat(`§3Discord > §r${guildPlayers[bridgeMessageMatched[1]] || bridgeMessageMatched[1]}§f:${chatMessage.slice(bridgeMessageMatched[0].length)}`);
		return cancel(event);
	}

	// parse player displayNames from '/gl'
	const playerListMatched = chatMessage.match(/(?:&[0-9a-gk-or]){0,2}(?:\[.+?\] )?\w+(?=&r&[ac]\s*●)/g);

	if (playerListMatched) {
		for (let i = 0; i < playerListMatched.length; ++i) {
			guildPlayers[playerListMatched[i].replace(/\[.+?\] |&[0-9a-gk-or]/g, '')] = playerListMatched[i];
		}

		// print(`[chatBridge]: cached ${Object.keys(guildPlayers).length} players`) // debug info
	}
});

// initial '/gl' parsing
let init = register('worldLoad', () => {
	setTimeout(() => {
		let isFirstExecution = true;

		const initCommand = register('chat', event => {
			const chatMessage = ChatLib.getChatMessage(event);

			if (/^Guild Name: |-- (?:[a-zA-Z]+ )+--|●|^(?:Total|Online) Members: /.test(chatMessage)) return cancel(event);

			if (chatMessage.includes('---------------------------------------')) {
				cancel(event);
				if (isFirstExecution) return isFirstExecution = false;
				initCommand.unregister();
			}
		}).setPriority(OnTrigger.Priority.LOWEST);

		ChatLib.command('gl');
	}, 5_000);

	init.unregister();
	init = undefined;
});
