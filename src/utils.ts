export const VK_VIDEO_REGEX = /^((?:https?:)?\/\/)?(?:www\.)?(?:vk\.com|vkvideo\.ru)\/(?:video_ext\.php\?oid=-?\d+&id=\d+(?:&\S*)?|video-?\d+_\d+(?:\/[\w%-]+)*|[^?]+\?(?=.*\bz=video-?\d+_\d).+)$/

export function isValidVkVideoUrl(url: string) {
	return url.match(VK_VIDEO_REGEX)
}

export enum Resolution {
	Res640x360 = 1,
	Res853x480 = 2,
	Res1280x720 = 3,
	Res1920x1080 = 4,
}

export type Timestamp = `${number}h${number}m${number}s`

export interface GetEmbedUrlOptions {
	url: string
	hd?: Resolution
	start?: Timestamp
	autoplay?: boolean
	loop?: boolean
	js_api?: boolean
}

export function getVkVideoEmbedUrl(options: GetEmbedUrlOptions) {
	const { url, hd, start, autoplay, loop, js_api } = options

	if (!isValidVkVideoUrl(url)) {
		return null
	}

	if (url.includes('/video_ext.php?')) {
		return url
	}

	const vkVideoRegex = /video(-?\d+)_(-?\d+)/i
	const matches = vkVideoRegex.exec(url)

	if (!matches || !matches[1] || !matches[2]) {
		return null
	}

	const outputUrl = new URL('https://vk.com/video_ext.php')
	const params = outputUrl.searchParams

	params.set('oid', matches[1])
	params.set('id', matches[2])

	if (hd)
		params.set('hd', String(hd))
	if (start)
		params.set('t', start)
	if (autoplay)
		params.set('autoplay', '1')
	if (loop)
		params.set('loop', '1')
	if (js_api)
		params.set('js_api', '1')

	return outputUrl.toString()
}
