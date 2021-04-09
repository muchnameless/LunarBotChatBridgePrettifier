import { @Vigilant, @TextProperty, @ColorProperty, @ButtonProperty, @SwitchProperty, @SelectorProperty, Color } from 'Vigilance';
import cache from './PlayerCache';

const colours = [ '§4Dark Red', '§cRed', '§6Gold', '§eYellow', '§2Dark Green', '§aGreen', '§bAqua', '§3Dark Aqua', '§1Dark Blue', '§9Blue', '§dLight Purple', '§5Dark Purple', '§fWhite', '§7Grey', '§8Dark Grey', '§0Black' ];
const colourCodes = colours.map(x => x.slice(0, 2));

@Vigilant('LunarBotChatBridgePrettifier')
class Settings {
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
		name: 'Enable Blocking',
		description: 'Ignore messages from players in "Blocked IGNs"',
		category: 'General',
	})
	enableBlocking = true;

	@TextProperty({
		name: 'Blocked IGNs',
		description: 'IGNs of players to ignore bridge messages from, separated by ","',
		category: 'General',
		placeholder: 'None',
	})
	_blockedIGNs = '';


	@TextProperty({
		name: 'Prefix',
		description: 'Chat prefix for bridge messages',
		category: 'Appearance',
		placeholder: 'None',
	})
	prefix = 'Discord > ';

	@SelectorProperty({
		name: 'Prefix Colour',
		description: 'Chat prefix colour for bridge messages',
		category: 'Appearance',
		options: colours,
	})
	_prefixColour = 7;

	@SelectorProperty({
		name: 'Uncached Player Colour',
		description: 'Colour for uncached players',
		category: 'Appearance',
		options: colours,
	})
	_uncachedPlayerColour = 2;


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

		this.registerListener('_prefixColour', newColour => this.prefixColour = colourCodes[newColour]);
		this.prefixColour = colourCodes[this._prefixColour];

		this.registerListener('_uncachedPlayerColour', newColour => this.uncachedPlayerColour = colourCodes[newColour]);
		this.uncachedPlayerColour = colourCodes[this._uncachedPlayerColour];

		this.registerListener('_blockedIGNs', newIGNs => this.blockedIGNs = newIGNs.split(','));
		this.blockedIGNs = this._blockedIGNs.split(',');
	}
}

export default new Settings;
