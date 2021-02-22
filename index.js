import { Setting, SettingsObject } from 'SettingsManager/SettingsManager';

const settings = new SettingsObject('LunarBotChatBridgePrettifier', [
	{
		name: 'Chat Bridge',
		settings: [
			new Setting.TextInput('Prefix', 'Discord > '),
			new Setting.StringSelector('Prefix colour', 7, [
				'§4Dark Red', '§cRed', '§6Gold', '§eYellow', '§2Dark Green', '§aGreen', '§bAqua', '§3Dark Aqua', '§1Dark Blue', '§9Blue', '§dLight Purple', '§5Dark Purple', '§fWhite', '§7Grey', '§8Dark Grey', '§0Black',
			]),
			new Setting.StringSelector('Unknown player colour', 2, [
				'§4Dark Red', '§cRed', '§6Gold', '§eYellow', '§2Dark Green', '§aGreen', '§bAqua', '§3Dark Aqua', '§1Dark Blue', '§9Blue', '§dLight Purple', '§5Dark Purple', '§fWhite', '§7Grey', '§8Dark Grey', '§0Black',
			]),
		],
	},
]).setCommand('chatbridge');

Setting.register(settings);


const guildPlayers = {};

register('chat', event => {
	const chatMessage = ChatLib.getChatMessage(event, true);

	// prettify chat bridge messages
	const bridgeMessageMatched = chatMessage.match(/^&r&2Guild > (?:&[0-9a-gk-or]){0,2}(?:\[.+?\] )?Lunar_Bot(?:_2)?(?: &[0-9a-gk-or]\[\w+\])?&f: &r(\w+):/);

	if (bridgeMessageMatched) {
		ChatLib.chat(`${settings.getSetting('Chat Bridge', 'Prefix colour').slice(0, 2)}${settings.getSetting('Chat Bridge', 'Prefix')}§r${guildPlayers[bridgeMessageMatched[1]] || settings.getSetting('Chat Bridge', 'Unknown player colour').slice(0, 2) + bridgeMessageMatched[1]}§f:${chatMessage.slice(bridgeMessageMatched[0].length)}`);
		return cancel(event);
	}

	// don't fill cache with randoms from partys
	if (chatMessage.startsWith('&eParty ')) return;

	// parse player displayNames from '/gl'
	const playerListMatched = chatMessage.match(/(?:&[0-9a-gk-or]){0,2}(?:\[.+?\] )?\w+(?=&r&[ac] ●)/g);

	if (playerListMatched) {
		for (let i = 0; i < playerListMatched.length; ++i) {
			guildPlayers[playerListMatched[i].replace(/\[.+?\] |&[0-9a-gk-or]/g, '')] = playerListMatched[i];
		}

		// print(`[chatBridge]: cached ${Object.keys(guildPlayers).length} players`) // debug info
	}
}).setPriority(OnTrigger.Priority.HIGH);


// initial '/gl' parsing
let init = register('worldLoad', () => {
	init.unregister();
	init = undefined;

	setTimeout(() => {
		let isFirstExecution = true;

		// stop '/gl' from showing up in chat
		const initCommand = register('chat', event => {
			const chatMessage = ChatLib.getChatMessage(event);

			if (/^Guild Name: |-- [a-zA-Z- ]+ --| ●|^(?:Total|Online) Members: /.test(chatMessage)) return cancel(event);

			if (chatMessage.includes('---------------------------------------')) {
				cancel(event);
				if (isFirstExecution) return isFirstExecution = false;
				initCommand.unregister();
			}
		});

		ChatLib.command('gl');
	}, 5_000);
});
