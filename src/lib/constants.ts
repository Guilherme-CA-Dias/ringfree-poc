export const RECORD_ACTIONS = [
	{
		key: "get-contacts",
		name: "Contacts",
		type: "default",
	},
	{
		key: "get-clients",
		name: "Clients",
		type: "default",
	},
] as const;

export type RecordActionKey = (typeof RECORD_ACTIONS)[number]["key"] | string;
