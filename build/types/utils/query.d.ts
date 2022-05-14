export declare type IdSelector = `#${string}` | `#${string} ${string}` | `#${string} > ${string}` | `${string}#${string}`;
export declare type ClassSelector = `.${string}` | `.${string} .${string}` | `.${string} > .${string}` | `${string}.${string}`;
export declare type AttributeSelector = `[${string}]` | `[${string}] ${string}` | `[${string}] > ${string}` | `${string}[${string}]`;
export declare function query<Tag extends keyof SVGElementTagNameMap>(selector: Tag | AttributeSelector | ClassSelector | IdSelector, parentElement?: HTMLElement): SVGElementTagNameMap[Tag];
export declare function query<Tag extends keyof HTMLElementTagNameMap>(selector: Tag | AttributeSelector | ClassSelector | IdSelector, parentElement?: HTMLElement): HTMLElementTagNameMap[Tag];
export declare function queryAll<Tag extends keyof SVGElementTagNameMap>(selector: Tag | AttributeSelector | ClassSelector | IdSelector, parentElement?: HTMLElement): NodeListOf<SVGElementTagNameMap[Tag]>;
export declare function queryAll<Tag extends keyof HTMLElementTagNameMap>(selector: Tag | AttributeSelector | ClassSelector | IdSelector, parentElement?: HTMLElement): NodeListOf<HTMLElementTagNameMap[Tag]>;
