interface Dimension {
	width: number;
	height: number;
}

interface AspectScale {
	getScaledDimensions(availWidth: number, availHeight: number): Dimension;
	getContainedDimensions(availWidth: number, availHeight: number): Dimension;
}
interface AspectScaleFactory {
	make(width: number, height: number): AspectScale;
}

interface Profile {
	orientationEvent: string;
	supportsTouch: bool;
	platform: string;
	vendor: string;
	os: string;
	browser: string;
	version: string;
	devicePixelRatio: number;
}

interface Events {
	start: string;
	move: string;
	end: string;
	isMouseEvent: bool;
}

interface ScoutEvent {
	bubbles: bool;
	cancelBubble: bool;
	cancelable: bool;
	clientX: number;
	clientY: number;
	clipboardData: any;
	currentTarget: HTMLElement;
	defaultPrevented: bool;
	deltaX: number;
	deltaY: number;
	distance: Function;
	distanceSquared: number;
	eventPhase: number;
	originalEvent: Event;
	returnValue: bool;
	screenX: number;
	screenY: number;
	srcElement: HTMLElement;
	target: HTMLElement;
	timestamp: number;
	type: string;
}

interface ArrayUtil {
	indexOfByPropValue(arr: any[],prop: string,value: any,offset: number): number;
	getItemByPropValue(arr: any[],prop: string,value: any): any;
	associativeLength(arr: any[]): number;
}

interface xhrOptions {
	url: string;
	context: any;
	method: string;
	headers: Object;
	responseType: string;
	data: any;
	timeout: number;
	progress: Function;
	timeoutHandler: Function;
	complete: Function;
}

interface ScoutStatic {
	(selector: string, context?: any): Scout;
	(selector: string[], context?: any): Scout;
    (element: Node): Scout;
    (elementArray: Node[]): Scout;
    (object: Scout): Scout;
    (func: Function): Scout;
    (t: any): Scout;
    (): Scout;

	extend(deep: bool, dest: any, src: any, rm?: Array);
	extend(dest: any, src: any, rm?: Array);
	register(module: any): void;
	fn: any;

	profile: Profile;
	automap(map: Object, src: Object): Object;
	stripPX(value: string): number;
	addPX(value: number): string;
	renderTemplate(template: string, data: Object): string;
	hideURLBar(): void;
	getURLParams(): Object;
	log(msg: string, force?: bool): void;
	log(obj: any, force?: bool): void;
	loadSrcFile(file: string, complete?: Function): void;
	defer(context: any, func: (evt: any) => any, args?: any[]): void;
	cacheToken(): string;
	clone(el: HTMLElement, deep?:bool): HTMLElement;

	ajax(url: string, options: Object): XMLHttpRequest;

	events: Events;
	easing: Array;
	motion(selectorOrElement: any, options: Object): void;

	uuid(): string;
	arrayUtil: ArrayUtil;
	aspectScale: AspectScaleFactory;
}

interface Scout extends Array {
	ready(callback: Function): Scout;
	each(func: (val: any, index: number, array: Array) => any): Scout;
	every(func: (val: any, index: number, array: Array) => bool): bool;
	concat(...items: any[]): Scout;
	concat(item: Scout): Scout;
	filter(func: (val: any, index: number, array: Array) => any): Scout;
	forEach(func: (val: any, index: number, array: Array) => any): void;
	indexOf(selector: string): number;
	indexOf(element: Element): number;
	join(separator: string, attr: string): string;
	lastIndexOf(selector: string): number;
	lastIndexOf(element: Element): number;
	map(func: (val: any, index: number, array: Array) => any, thisArg: any): Scout;
	pop(): Scout;
	push(): number;
	reduce(func: (previousValue: any, currentValue: any, index: number, array: Array) => any): any;
	reduceRight(func: (previousValue: any, currentValue: any, index: number, array: Array) => any): any;
	reverse(): Scout;
	shift(): Scout;
	slice(begin: number, end: number): Scout;
	splice(begin: number, howMany: number, add?: Scout): Scout;
	splice(begin: number, howMany: number, ...add: Element[]): Scout;
	some(func: (val: any, index: number, array: Array) => bool): bool;
	sort(func: (previousValue: any, currentValue: any) => number): Scout;
	unshift(): number;

	attr(name: string, value?: any): any;
	attr(propVal: Object): any;
	removeAttr(name: string): string;
	prop(name: string, value?: any): any;
	data(key: string, value?: any): any;
	removeData(key: string): any;
	val(): any;

	html(): string;
	html(htmlString: string): Scout;
	html(element: HTMLElement): Scout;
	html(elements: Array): Scout;
	html(func: (index: number, currVal: any) => any): Scout;
	
	text(): string;
	text(text: string): any;
	text(func: (index: number, currVal: any) => any): any;

	append(htmlString: string): Scout;
	append(element: HTMLElement): Scout;
	append(elements: Array): Scout;
	appendTo(target: any): Scout;

	prepend(htmlString: string): Scout;
	prepend(element: HTMLElement): Scout;
	prepend(elements: Array): Scout;
	prependTo(target: any): Scout;

	before(htmlString: string): Scout;
	before(element: HTMLElement): Scout;
	before(elements: Array): Scout;

	after(htmlString: string): Scout;
	after(element: HTMLElement): Scout;
	after(elements: Array): Scout;

	replaceWith(htmlString: string): Scout;
	replaceWith(element: HTMLElement): Scout;
	replaceWith(elements: Array): Scout;

	empty(): Scout;

	index(selectorOrElement?: any): number;
	parent(): Scout;
	children(selectorOrElement?: any): Scout;
	siblings(selectorOrElement?: any): Scout;
	find(selector: string): Scout;
	closest(selector: string, context?: Element): Scout;
	remove(): Scout;

	css(property: string): string; 
	css(property: string, value: string): Scout;
	css(property: string, value: number): Scout;
	css(propVal: Object): Scout;
	hasClass(className: string): bool;
	addClass(className: string): Scout;
	removeClass(className: string): Scout;
	toggleClass(className: string): Scout;
	copyStyle(element: HTMLElement): Scout;

	height(): number;
	width(): number;

	on(type: string, callback: Function): Scout;
	on(type: string, selector: string, callback: Function): Scout;
	one(type: string, callback: Function): Scout;
	one(type: string, selector: string, callback: Function): Scout;
	off(type: string, callback: Function): Scout;
	off(type: string, selector: string, callback: Function): Scout;
	bind(event: string, callback: Function): Scout;
	unbind(event: string, callback: Function): Scout;
	delegate(selector: string, event: string, callback: Function): Scout;

	touch(eventType: string, callback: (evt: any) => any, options?: Object): Scout;
	removeTouch(): Scout;

	animate(properties: Object, duration?: number, options?: Object): Scout;
}

declare var Scout: ScoutStatic;
declare var $: ScoutStatic;
declare var S: ScoutStatic;