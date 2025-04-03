import type {Resolution, Timestamp} from './utils.js'
import { getVkVideoEmbedUrl, isValidVkVideoUrl, VK_VIDEO_REGEX } from './utils.js'

import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'

export interface VkVideoOptions {
	/**
	 * Controls if the paste handler for VK videos should be added.
	 * @default true
	 * @example false
	 */
	addPasteHandler: boolean

	/**
	 * The width of the VK video.
	 * @default 640
	 * @example 1280
	 */
	width: number

	/**
	 * The height of the VK video.
	 * @default 480
	 * @example 720
	 */
	height: number

	/**
	 * The video quality/resolution.
	 * @default undefined
	 * @example Resolution.Res1280x720
	 */
	hd: Resolution

	/**
	 * Controls if the VK video should autoplay.
	 * @default false
	 * @example true
	 */
	autoplay: boolean

	/**
	 * Controls if the VK video should loop.
	 * @default false
	 * @example true
	 */
	loop: boolean

	/**
	 * Controls if the JavaScript API should be enabled.
	 * @default false
	 * @example true
	 */
	jsApi: boolean

	/**
	 * Controls if the VK node should be inline or not.
	 * @default false
	 * @example true
	 */
	inline: boolean

	/**
	 * Controls if the VK video should be allowed to go fullscreen.
	 * @default true
	 * @example false
	 */
	allowFullscreen: boolean

	/**
	 * The HTML attributes for a VK video node.
	 * @default {}
	 * @example { class: 'foo' }
	 */
	HTMLAttributes: Record<string, any>
}

/**
 * The options for setting a VK video.
 */
interface SetVkVideoOptions {
	src: string,
	width?: number,
	height?: number,
	start?: Timestamp
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		vkVideo: {
			/**
			 * Insert a VK video
			 * @param options The VK video attributes
			 * @example editor.commands.setVkVideo({ src: 'https://vk.com/video-197013187_456239246' })
			 */
			setVkVideo: (options: SetVkVideoOptions) => ReturnType
		}
	}
}

/**
 * This extension adds support for VK videos.
 */
export const VkVideo = Node.create<VkVideoOptions>({
	name: 'vkVideo',

	addOptions() {
		return {
			addPasteHandler: true,
			width: 640,
			height: 480,
			hd: undefined,
			autoplay: false,
			loop: false,
			jsApi: false,
			inline: false,
			allowFullscreen: true,
			HTMLAttributes: {},
		}
	},

	inline() {
		return this.options.inline
	},

	group() {
		return this.options.inline ? 'inline' : 'block'
	},

	draggable: true,

	addAttributes() {
		return {
			src: {
				default: null,
			},
			width: {
				default: this.options.width,
			},
			height: {
				default: this.options.height,
			},
			start: {
				default: null,
			},
		}
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-vk-video] iframe',
			},
		]
	},

	addCommands() {
		return {
			setVkVideo: (options: SetVkVideoOptions) => ({ commands }) => {
				if (!isValidVkVideoUrl(options.src)) {
					return false
				}

				return commands.insertContent({
					type: this.name,
					attrs: options,
				})
			},
		}
	},

	addPasteRules() {
		if (!this.options.addPasteHandler) {
			return []
		}

		return [
			nodePasteRule({
				find: new RegExp(VK_VIDEO_REGEX, 'g'),
				type: this.type,
				getAttributes: (match) => {
					return { src: match.input }
				},
			}),
		]
	},

	renderHTML({ HTMLAttributes }) {
		HTMLAttributes.src = getVkVideoEmbedUrl({
			url: HTMLAttributes.src,
			hd: this.options.hd,
			start: HTMLAttributes.start,
			autoplay: this.options.autoplay,
			loop: this.options.loop,
			js_api: this.options.jsApi,
		})

		return [
			'div',
			{ 'data-vk-video': '' },
			[
				'iframe',
				mergeAttributes(
					this.options.HTMLAttributes,
					{
						width: this.options.width,
						height: this.options.height,
						allowfullscreen: this.options.allowFullscreen,
						frameborder: '0',
					},
					HTMLAttributes,
				),
			],
		]
	},
})
