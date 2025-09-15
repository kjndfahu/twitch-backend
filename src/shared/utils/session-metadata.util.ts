import { Request } from "express";
import { SessionMetadata } from "../types/session-metadata.types";
import DeviceDetector = require("device-detector-js");
import * as countries from 'i18n-iso-countries'
import { IS_DEV_ENV } from "./is-dev.util";
import { lookup } from "geoip-lite";

countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export function getSessionMetadata(req: Request, userAgent: string): SessionMetadata{
	const forwarded = (req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for']) as string | string[] | undefined
	let ip = IS_DEV_ENV
		? '173.166.154.221'
		: Array.isArray(forwarded)
			? forwarded[0]
			: typeof forwarded === 'string'
				? forwarded.split(',')[0].trim()
				: req.ip

	if (!ip) ip = '127.0.0.1'

	const location = ip ? lookup(ip) : null
	const device = new DeviceDetector().parse(userAgent ?? '')

	return {
		location: {
			country: location?.country ? (countries.getName(location.country, 'en') ?? 'Неизвестно') : 'Неизвестно',
			city: location?.city ?? 'Неизвестно',
			latitude: location?.ll?.[0] ?? 0,
			longitude: location?.ll?.[1] ?? 0
		},
		device: {
			browser: device.client?.name ?? 'Unknown',
			os: device.os?.name ?? 'Unknown',
			type: device.device?.type ?? 'Unknown',
		},
		ip
	}
}