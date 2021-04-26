class PlayerCache extends Map {
	removeFormatting(string) {
		return string.replace(/\[.+?\]|&[0-9a-gk-or]/g, '').trim();
	}

	add(ign) {
		return this.set(this.removeFormatting(ign), ign);
	}

	remove(ign) {
		return this.delete(this.removeFormatting(ign));
	}

	populate() {
		let isFirstExecution = true;

		// stop 1 execution of '/gl' from showing up in chat
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
	}
}

export default new PlayerCache();
