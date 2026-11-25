const EMOJI_CHAR_RE = /[\u{10000}-\u{10FFFF}]|\p{Extended_Pictographic}|\uFE0F|\u200D/gu
export function encodeEmoji(text: string): string {
    return text.replace(EMOJI_CHAR_RE, (ch) => `[e:${ch.codePointAt(0)!.toString(16)}]`)
}
export function decodeEmoji(text: string): string {
    return text.replace(/\[e:([0-9a-f]{2,6})\]/g, (raw, hex: string) => {
        const code = parseInt(hex, 16)
        return code <= 0x10ffff ? String.fromCodePoint(code) : raw
    })
}