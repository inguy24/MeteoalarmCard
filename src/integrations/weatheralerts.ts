import { HassEntity } from 'home-assistant-js-websocket';
import {
	MeteoalarmAlert,
	MeteoalarmEventType,
	MeteoalarmIntegration,
	MeteoalarmIntegrationEntityType,
	MeteoalarmIntegrationMetadata,
	MeteoalarmLevelType,
} from '../types';
import { Utils } from '../utils';

type WeatheralertsAlert = {
	event: string;
	severity: string;
	title: string;
};

type WeatheralertsEntity = HassEntity & {
	attributes: {
		integration: string;
		alerts: WeatheralertsAlert[];
	};
};

export default class Weatheralerts implements MeteoalarmIntegration {
	public get metadata(): MeteoalarmIntegrationMetadata {
		return {
			key: 'weatheralerts',
			name: 'Weatheralerts',
			type: MeteoalarmIntegrationEntityType.SingleEntity,
			returnHeadline: true,
			returnMultipleAlerts: true,
			entitiesCount: 1,
			monitoredConditions: Utils.convertEventTypesForMetadata(this.eventTypes),
		};
	}

	public supports(entity: WeatheralertsEntity): boolean {
		return entity.attributes.integration == 'weatheralerts';
	}

	public alertActive(entity: WeatheralertsEntity): boolean {
		return Number(entity.state) > 0;
	}

	private get eventTypes(): { [key: string]: MeteoalarmEventType } {
		// Event types from NWS CAP Documentation - https://vlab.noaa.gov/web/nws-common-alerting-protocol/cap-documentation#eventcode
		return {
			'911 Telephone Outage’: MeteoalarmEventType.Unknown,
			'Air Quality': MeteoalarmEventType.AirQuality,
			'Air Stagnation’: MeteoalarmEventType.AirQuality,
			'Ashfall’: MeteoalarmEventType.AirQuality,
			'Avalanche’: MeteoalarmEventType.SnowIce,
			'Blue’: MeteoalarmEventType.Unknown,
			'Beach Hazards': MeteoalarmEventType.CoastalEvent,
			'Blizzard': MeteoalarmEventType.SnowIce,
			'Blowing Dust': MeteoalarmEventType.Dust,
			'Brisk Wind’: MeteoalarmEventType.Wind,
			'Child Abduction’: MeteoalarmEventType.Unknown,
			'Civil Danger’: MeteoalarmEventType.Unknown,
			'Civil Emergency’: MeteoalarmEventType.Unknown,
			'Coastal Flood': MeteoalarmEventType.Flooding,
			'Dense Fog': MeteoalarmEventType.Fog,
			'Dense Smoke’: MeteoalarmEventType.ForestFire,
			'Dust Storm’: MeteoalarmEventType.Dust,
			'Earthquake': MeteoalarmEventType.Unknown;
			'Evacuation - Immediate’: MeteoalarmEventType.Unknown,
			'Extreme Cold’: MeteoalarmEventType.LowTemperature,
			'Excessive Heat': MeteoalarmEventType.HighTemperature,
			'Extreme Fire’: MeteoalarmEventType.ForestFire,
			'Extreme Wind': MeteoalarmEventType.Wind,
			'Fire Weather': MeteoalarmEventType.ForestFire,
			'Fire’: MeteoalarmEventType.ForestFire,
			'Flash Flood': MeteoalarmEventType.Flooding,
			'Flood': MeteoalarmEventType.Flooding,
			'Freeze': MeteoalarmEventType.LowTemperature,
			'Freezing Fog’: MeteoalarmEventType.SnowIce,
			'Freezing Spray’: MeteoalarmEventType.SeaEvent,
			'Frost': MeteoalarmEventType.LowTemperature,
			'Gale': MeteoalarmEventType.SeaEvent,
			'Hard Freeze’: MeteoalarmEventType.LowTemperature,
			'Hazardous Materials’: MeteoalarmEventType.Unknown,
			'Hazardous Seas': MeteoalarmEventType.SeaEvent,
			'Hazardous Weather': MeteoalarmEventType.Unknown;
			'Heavy Freezing Spray’: MeteoalarmEventType.SeaEvent,
			'Heat': MeteoalarmEventType.HighTemperature,
			'High Surf': MeteoalarmEventType.CoastalEvent,
			'High Wind': MeteoalarmEventType.Wind,
			'Hurricane Force Wind': MeteoalarmEventType.SeaEvent,
			'Hurricane': MeteoalarmEventType.Hurricane,
			'Hydrologic’: MeteoalarmEventType.Unknown,
			'Ice Storm': MeteoalarmEventType.SnowIce,
			'Lake Effect Snow’: MeteoalarmEventType.SnowIce,
			'Lake Wind’: MeteoalarmEventType.SeaEvent,
			'Lakeshore Flood’: MeteoalarmEventType.Flooding,
			'Local Area’: MeteoalarmEventType.Unknown,
			'Law Enforcement’: MeteoalarmEventType.Unknown,
			'Marine Weather’: MeteoalarmEventType.SeaEvent,
			'Nuclear Power Plant’: MeteoalarmEventType.Unknown,
			'Radiological Hazard’: MeteoalarmEventType.Unknown,
			'Red Flag': MeteoalarmEventType.ForestFire,
			'Rip Current': MeteoalarmEventType.CoastalEvent,
			'River Flood': MeteoalarmEventType.Flooding,
			'Severe Thunderstorm': MeteoalarmEventType.Thunderstorms,
			'Shelter In Place’: MeteoalarmEventType.Unknown,
			'Small Craft': MeteoalarmEventType.SeaEvent,
			'Snow Squall’: MeteoalarmEventType.SnowIce,
			'Special Marine': MeteoalarmEventType.SeaEvent,
			'Special Weather': MeteoalarmEventType.Unknown,
			'Storm Surge’: MeteoalarmEventType.CoastalEvent,
			'Storm': MeteoalarmEventType.SeaEvent,
			'Tornado': MeteoalarmEventType.Tornado,
			'Tropical Cyclone’: MeteoalarmEventType.Hurricane,
			'Tropical Storm': MeteoalarmEventType.Hurricane,
			'Tsunami’: MeteoalarmEventType.CoastalEvent,
			'Typhoon Local’: MeteoalarmEventType.Hurricane,
			'Typhoon’: MeteoalarmEventType.Hurricane,
			'Volcano’: MeteoalarmEventType.Unknown,
			'Wind Chill': MeteoalarmEventType.LowTemperature,
			'Winter Storm': MeteoalarmEventType.SnowIce,
			'Winter Weather': MeteoalarmEventType.SnowIce,
			'Wind': MeteoalarmEventType.Wind,
		};
	}

	private get eventLevels(): { [key: string]: MeteoalarmLevelType } {
		// Event types from: https://www.weather.gov/lwx/WarningsDefined
		return {
			Warning: MeteoalarmLevelType.Red,
			Statement: MeteoalarmLevelType.Orange,
			Watch: MeteoalarmLevelType.Orange,
			Advisory: MeteoalarmLevelType.Yellow,
			Alert: MeteoalarmLevelType.Yellow,
			Outlook: MeteoalarmLevelType.Orange,
			Emergency: MeteoalarmLevelType.Red,
		};
	}

	public getAlerts(entity: WeatheralertsEntity): MeteoalarmAlert[] {
		const { alerts } = entity.attributes;

		const result: MeteoalarmAlert[] = [];

		for (const alert of alerts) {
			const fullAlertName = alert.event;
			let alertLevel: MeteoalarmLevelType | undefined = undefined;
			let alertType: MeteoalarmEventType | undefined = undefined;

			for (const [levelName, level] of Object.entries(this.eventLevels)) {
				if (!fullAlertName.includes(levelName)) continue;
				alertLevel = level;
				const alertName = fullAlertName.replace(levelName, '').trim();
				alertType = this.eventTypes[alertName];
				if (alertType == undefined) {
					throw Error(`Unknown weatheralerts alert type: ${alertName}`);
				}
			}

			if (alertLevel == undefined) {
				throw Error(`Unknown weatheralerts alert level: ${fullAlertName}`);
			}

			result.push({
				headline: fullAlertName,
				level: alertLevel,
				event: alertType!,
			});
		}
		return result;
	}
}
