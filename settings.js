import { @Vigilant, @TextProperty, @ButtonProperty, @SwitchProperty, @SelectorProperty } from 'Vigilance';
import cache from './PlayerCache';

const colours = [ '§4Dark Red', '§cRed', '§6Gold', '§eYellow', '§2Dark Green', '§aGreen', '§bAqua', '§3Dark Aqua', '§1Dark Blue', '§9Blue', '§dLight Purple', '§5Dark Purple', '§fWhite', '§7Grey', '§8Dark Grey', '§0Black' ];
const colourCodes = colours.map(x => x.slice(0, 2));

@Vigilant('LunarBotChatBridgePrettifier')
class Settings {

	/**
	 * General
	 */
	
	@SwitchProperty({
		name: 'Enabled',
		description: 'Enables the ct module',
		category: 'General',
	})
	enabled = true;

	@SwitchProperty({
		name: 'Debug',
		description: 'Prints debug messages to \'ct console js\'',
		category: 'General',
	})
	debug = false;

	@TextProperty({
		name: 'Bot IGN',
		description: 'IGN of the bot account (case sensitive)',
		category: 'General',
		placeholder: 'None',
	})
	botIGN = 'Lunar_Bot(?:_2)?';

	@SwitchProperty({
		name: 'Enable IGN Blocking',
		description: 'Ignore messages from players in "Blocked IGNs"',
		category: 'General',
	})
	enableIGNBlocking = false;

	@TextProperty({
		name: 'Blocked IGNs',
		description: 'IGNs of players to ignore bridge messages from, case insensitive, separated by ","',
		category: 'General',
		placeholder: 'None',
	})
	_blockedIGNs = '';

	@SwitchProperty({
		name: 'Enable Content Blocking',
		description: 'Ignore messages which contain certain phrases',
		category: 'General',
	})
	enableContentBlocking = false;

	@TextProperty({
		name: 'Blocked Content',
		description: 'Regular expression to filter the content by. Since the input is via a string you need to double escape (\'\\\' -> \'\\\\\'). Use \'regex101.com\', choose ECMAScript on the left and set the flags to \'i\'',
		category: 'General',
		placeholder: 'None',
	})
	_contentFilter = '';

	@ButtonProperty({
		name: 'Blocked Messages',
		description: 'Show blocked messages',
		category: 'General',
		placeholder: 'Show'
	})
	showConsoleButtonAction() {
		ChatLib.command('ct console js', true);
	}

	/**
	 * Appearance
	 */

	@TextProperty({
		name: 'Prefix',
		description: 'Chat prefix for bridge messages',
		category: 'Appearance',
		placeholder: 'None',
	})
	_prefix = 'Discord > ';

	@SelectorProperty({
		name: 'Prefix Colour',
		description: 'Chat prefix colour for bridge messages',
		category: 'Appearance',
		options: colours,
	})
	_prefixColour = 7;

	@TextProperty({
		name: 'Postfix',
		description: 'Chat postfix for bridge messages',
		category: 'Appearance',
		placeholder: 'None',
	})
	_postfix = '';

	@SelectorProperty({
		name: 'Postfix Colour',
		description: 'Chat postfix colour for bridge messages',
		category: 'Appearance',
		options: colours,
	})
	_postfixColour = 7;

	@SelectorProperty({
		name: 'Uncached Player Colour',
		description: 'Colour for uncached players',
		category: 'Appearance',
		options: colours,
	})
	_uncachedPlayerColour = 2;

	@ButtonProperty({
		name: 'Test',
		description: 'Sends test messages in chat',
		category: 'Appearance',
		placeholder: 'Test'
	})
	testButtonAction() {
		ChatLib.chat(`${this.prefix}§r§6[MVP§4++§6] In_Guild${this.postfix}§r: test 1`);
		ChatLib.chat(`${this.prefix}§r${this.uncachedPlayerColour}Not_In_Guild${this.postfix}§r: test 2`);
	}

	/**
	 * Player Cache
	 */

	@ButtonProperty({
		name: 'Reload',
		description: 'Reloads the player cache from \'/guild list\'',
		category: 'Player Cache',
		placeholder: 'Reload'
	})
	reloadButtonAction() {
		cache.clear();
		cache.populate();
	}

	@ButtonProperty({
		name: 'Clear',
		description: 'Empties the player cache',
		category: 'Player Cache',
		placeholder: 'Clear'
	})
	clearButtonAction() {
		cache.clear();
	}


	constructor() {
		this.initialize(this);

		this.setCategoryDescription('General', 'General settings');
		this.setCategoryDescription('Appearance', 'Change the appearance of bridge messages');

		this.registerListener('enabled', status => status && cache.populate());

		const splitIGNs = igns => igns
			.split(',')
			.map(ign => ign.replace(/\W/g, '').toLowerCase())
			.filter(({ length }) => length);

		this.registerListener('_blockedIGNs', newIGNs => this.blockedIGNs = splitIGNs(newIGNs));
		this.blockedIGNs = splitIGNs(this._blockedIGNs);

		this.registerListener('_contentFilter', newContent => this.contentFilter = new RegExp(newContent, 'i'));
		this.contentFilter = new RegExp(this._contentFilter, 'i');
	}

	get prefix() {
		return `${colourCodes[this._prefixColour]}${this._prefix}`
	}

	get postfix() {
		return `${colourCodes[this._postfixColour]}${this._postfix}`;
	}

	get uncachedPlayerColour() {
		return colourCodes[this._uncachedPlayerColour];
	}
}

export default new Settings();
