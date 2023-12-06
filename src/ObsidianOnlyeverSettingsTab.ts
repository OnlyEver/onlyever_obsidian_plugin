import {
	App, debounce,
	ExtraButtonComponent,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";
import {OnlyEverApi} from "./Api/onlyEverApi";
import MyPlugin from "../main";

export class ObsidianOnlyeverSettingsTab extends PluginSettingTab {
	plugin: MyPlugin;
	onlyEverApi: OnlyEverApi;
	onlyEverPermanent: OnlyEverApi;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.onlyEverApi = new OnlyEverApi(this.plugin.settings.apiToken);
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl("h2", {
			text: "Settings for Obsidian-Onlyever-Plugin.",
		});

		let textElement: TextComponent;
		let validityElement: ExtraButtonComponent;

		const debouncedTokenVerification  = debounce((value: string)=>{
			this.onlyEverApi.validateApiToken(value).then(async (result) => {
				if (result.status) {
					this.plugin.settings['userId'] = result.userId
					await this.plugin.saveData(this.plugin.settings)
					validityElement.setIcon("checkIcon");
					errorElement.innerText = "";
				} else if (result["status"] === false) {
					validityElement.setIcon("crossIcon");
					errorElement.addClass("error");
					errorElement.innerText = value.length > 0 ? "The PLUGIN TOKEN is incorrect." : "";
				}
			})
		}, 150, true)


		new Setting(containerEl)
			.setName("PLUGIN TOKEN")
			.setDesc("Enter Plugin Token here")
			.addText((text) => {
				textElement = text as TextComponent;
				text.setPlaceholder("Plugin Token")
					.setValue(this.plugin.settings.apiToken)
					.onChange(async (value) => {
						this.plugin.settings.apiToken = value;
						this.plugin.settings.tokenValidity = null;

						if (value.length && value != "") {
							debouncedTokenVerification(value)
						}

						if (!text.getValue().length || text.getValue() === null) {
							errorElement.innerText = "";
							validityElement.setIcon("circle-slash");
						}

						await this.plugin.saveSettings();
					});
			})
			.addExtraButton((extra) => {
				validityElement = extra as ExtraButtonComponent;
				validityElement.setIcon("circle-slash").extraSettingsEl;

				if (this.plugin.settings.tokenValidity) {
					extra.setIcon("checkIcon");
				} else if (
					this.plugin.settings.tokenValidity === false &&
					this.plugin.settings.apiToken.length > 0
				) {
					extra.setIcon("crossIcon");
				}
			})
			.addToggle((toggle) => {
				textElement.inputEl.setAttribute("type", "password");

				toggle.setValue(false).onChange(async (value) => {
					if (value) {
						textElement.inputEl.setAttribute("type", "text");
					} else {
						textElement.inputEl.setAttribute("type", "password");
					}
				});
			});

		const errorElement = containerEl.createEl("div");
	}
}
