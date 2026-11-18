export function getConversationId(name: string, isGroup: boolean):string{
    const prefix = isGroup ? "room" : "people";
    return `${prefix}:${name}`;
}