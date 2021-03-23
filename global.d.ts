declare module 'dir:*' {
    const Paths: string[];
    export = Paths;
}

declare module 'content:*' {
	interface Item {
		name: string;
		title?: string;
		description?: string;
		image?: string;
		url?: string;
		// load(): Promise<{ default: string }>;
	}
    const Data: Item[];
    export = Data;
}

declare module 'markdown:*' {
    const Url: string;
    export = Url;
}
