import axios from "axios";
import { Notice, App } from "obsidian";

interface ApiData {
	success: boolean;
	data: object;
	fileToken: string;
}

class OnlyEverApi {
	app: App;
	apiToken: string;

	constructor(apiToken: string) {
		this.app = app;
		this.apiToken = apiToken;
	}

	/**
	 * Syncs Multiple file with only ever atlas
	 *
	 * @param files
	 *
	 * @return void
	 */
	async syncFiles(files: object[]) {
		try {
			const endpoint = `https://asia-south1.gcp.data.mongodb-api.com/app/only_ever_staging-mbvds/endpoint/notes?pluginName=obsidian&token=${this.apiToken}`;

			if (files.length > 0) {
				axios({
					method: "post",
					url: endpoint,
					headers: {
						"Content-Type": "application/json",
					},
					data: files,
				})
					.then((res) => {
						if ((res?.data as ApiData).success) {
							new Notice(`Synced file successfully`, 400);
						} else {
							new Notice(
								"Notes sync failed. Please ensure you have correct plugin token in the settings."
							);
						}
					})
					.catch((err) => {
						let errorMessage =
							"Notes sync failed. Please ensure you have correct plugin token in the settings.";

						if (err["code"] === "ERR_NETWORK") {
							errorMessage =
								"Notes sync failed. Please ensure you have internet connection.";
						}

						new Notice(errorMessage);
					});
			}
		} catch (err) {
			new Notice(`Failed to sync file`);
		}
	}

	/**
	 * Validate api token
	 *
	 * @return ?string
	 */
	async validateApiToken(token: string) {
		try {
			const endpoint = `https://asia-south1.gcp.data.mongodb-api.com/app/only_ever_staging-mbvds/endpoint/verifyToken?pluginName=obsidian&token=${token}`;

			return axios({
				method: "post",
				url: endpoint,
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((res) => {
					if ((res?.data as ApiData)?.success) {
						return {'status':true, 'imagePath':(res?.data as ApiData)?.fileToken};
					}

					return {'status':true, 'imagePath':(res?.data as ApiData)?.fileToken};
				})
				.catch((err) => {
					if (err["code"] === "ERR_NETWORK") {
						new Notice(
							"Token verification failed. Please ensure you have internet connection."
						);

						return {'status':null, 'imagePath':''};
					}

					return {'status':false, 'imagePath':''};
				});
		} catch (err) {
			return {'status':false, 'imagePath':''};
		}
	}

	async syncImages(data:object){
		console.log('eta pugyo')
		try {
			const endpoint = `https://asia-south1.gcp.data.mongodb-api.com/app/only_ever_staging-mbvds/endpoint/syncImages?pluginName=obsidian&token=${this.apiToken}`;
			let fileUrl = '';
				axios({
					method: "post",
					url: endpoint,
					headers: {
						"Content-Type": "application/json",
					},
					data: data,
				}).then((res) => {
					if ((res?.data as ApiData).success) {
						new Notice(`Synced file successfully`, 400);

						fileUrl = res.data.filePath;
					} else {
						new Notice(
							"Notes sync failed. Please ensure you have correct plugin token in the settings."
						);
					}
				})

			return fileUrl;
		}catch (e){
			console.log(e)
		}
	}
}

export { OnlyEverApi };
