// event types
export interface EventTypes {
  //[key: string]: (...args: any[]) => void
}

// listener map
type ListenerMapTypes<Events extends EventTypes> = {
  [Key in keyof Events]: Events[Key][];
}

interface ListenerMap<Events extends EventTypes, ValueTypes extends ListenerMapTypes<Events>> {
  clear(): void;
  delete<Key extends keyof ValueTypes>(key: Key): boolean;
  entries<Key extends keyof ValueTypes>(): IterableIterator<[Key, ValueTypes[Key]]>;
  forEach<Key extends keyof ValueTypes>(callbackFn: (value: ValueTypes[Key], key: Key, map: ListenerMap<Events, ValueTypes>) => void, thisArg?: any): void;
  get<Key extends keyof ValueTypes>(key: Key): ValueTypes[Key] | undefined;
  has<Key extends keyof ValueTypes>(key: Key): boolean;
  keys(): IterableIterator<keyof ValueTypes>;
  set<Key extends keyof ValueTypes>(key: Key, value: ValueTypes[Key]): ListenerMap<Events, ValueTypes>;
  readonly size: number;
  values(): IterableIterator<ValueTypes[keyof ValueTypes]>;
}

// emitter interface
interface TypedEmitter<Events extends EventTypes> {
  addListener<Name extends keyof Events>(eventName: Name, listener: Events[Name]): TypedEmitter<Events>;
  emit<Name extends keyof Events>(eventName: Name, ...args: Parameters<Events[Name]>): boolean;
  eventNames(): (keyof Events)[];
  getMaxListeners(): number;
  listenerCount<Name extends keyof Events>(eventName: Name, listener?: Events[Name]): number;
  listeners<Name extends keyof Events>(eventName: Name): Events[Name][];
  off<Name extends keyof Events>(eventName: Name, listener: Events[Name]): TypedEmitter<Events>;
  on<Name extends keyof Events>(eventName: Name, listener: Events[Name]): TypedEmitter<Events>;
  once<Name extends keyof Events>(eventName: Name, listener: Events[Name]): TypedEmitter<Events>;
  prependListener<Name extends keyof Events>(eventName: Name, listener: Events[Name]): TypedEmitter<Events>;
  prependOnceListener<Name extends keyof Events>(eventName: Name, listener: Events[Name]): TypedEmitter<Events>;
  rawListeners<Name extends keyof Events>(eventName: Name): Events[Name][];
  removeAllListeners<Name extends keyof Events>(eventName: Name): TypedEmitter<Events>;
  removeListener<Name extends keyof Events>(eventName: Name, listener: Events[Name]): TypedEmitter<Events>;
  setMaxListeners(n: number): TypedEmitter<Events>
}

// emitter class
export class Emitter<Events extends EventTypes> implements TypedEmitter<Events> {
  private readonly listenerMap = new Map() as ListenerMap<Events, ListenerMapTypes<Events>>;
  private maxListeners: number = 25;

  public addListener<Name extends keyof Events>(eventName: Name, listener: Events[Name]): Emitter<Events> {
    const listenerList = this.listenerMap.get(eventName);
    if (listenerList) listenerList.push(listener);
    else this.listenerMap.set(eventName, [listener]);
    return this;
  }

  public emit<Name extends keyof Events>(eventName: Name, ...args: Parameters<Events[Name]>): boolean {
    const listenerList = this.listenerMap.get(eventName);
    if (!listenerList) return false;
    for (const listener of listenerList) listener(...args);
    return listenerList.length > 0;
  }

  public eventNames(): (keyof Events)[] {
    const eventNames = this.listenerMap.keys();
    return Array.from(eventNames);
  }

  public getMaxListeners(): number {
    return this.maxListeners;
  }

  public listenerCount<Name extends keyof Events>(eventName: Name, listener?: Events[Name] | undefined): number {
    const listenerList = this.listenerMap.get(eventName);
    if (!listenerList) return 0;
    return listenerList.filter(registeredListener => listener !== undefined ? registeredListener === listener : registeredListener).length;
  }

  public listeners<Name extends keyof Events>(eventName: Name): Events[Name][] {
    const listenerList = this.listenerMap.get(eventName) ?? [];
    return listenerList;
  }

  public off<Name extends keyof Events>(eventName: Name, listener: Events[Name]): Emitter<Events> {
    return this.removeListener(eventName, listener);
  }

  public on<Name extends keyof Events>(eventName: Name, listener: Events[Name]): Emitter<Events> {
    return this.addListener(eventName, listener);
  }

  public once<Name extends keyof Events>(eventName: Name, listener: Events[Name]): Emitter<Events> {
    const removeListener = () => this.off(eventName, onceWrapper);

    const onceWrapper = (function(...args: Parameters<typeof listener>) {
      listener(...args);
      removeListener();
    }).bind(this) as Events[Name];
  
    this.addListener(eventName, onceWrapper);  
    return this;
  }

  public prependListener<Name extends keyof Events>(eventName: Name, listener: Events[Name]): Emitter<Events> {
    const listenerList = this.listenerMap.get(eventName);
    this.listenerMap.set(eventName, [listener].concat(listenerList ?? []));
    return this;
  }

  public prependOnceListener<Name extends keyof Events>(eventName: Name, listener: Events[Name]): Emitter<Events> {
    const listenerList = this.listenerMap.get(eventName);

    const removeListener = () => this.off(eventName, onceWrapper);

    const onceWrapper = (function(...args: Parameters<typeof listener>) {
      listener(...args);
      removeListener();
    }).bind(this) as Events[Name];
  
    this.listenerMap.set(eventName, [onceWrapper].concat(listenerList ?? []));
    return this;
  }

  public rawListeners<Name extends keyof Events>(eventName: Name): Events[Name][] {
    const listenerList = this.listenerMap.get(eventName);
    if (!listenerList) return [];
    return listenerList.slice();
  }

  public removeAllListeners<Name extends keyof Events>(eventName: Name): Emitter<Events> {
    this.listenerMap.delete(eventName);
    return this;
  }

  public removeListener<Name extends keyof Events>(eventName: Name, listener: Events[Name]): Emitter<Events> {
    const listenerList = this.listenerMap.get(eventName);
    if (!listenerList) return this;
    listenerList.splice(listenerList.indexOf(listener), 1);
    return this;
  }

  public setMaxListeners(n: number): Emitter<Events> {
    this.maxListeners = n;
    return this;
  }
}

// example
//interface EventTypesExample extends EventTypes {
//  a: () => void;
//  b: (bb: number) => void;
//}

//const emitter = new Emitter<EventTypesExample>();
//emitter.emit("b", 1);
//emitter.emit("a");

//emitter.on("a", () => console.log("AAAA"))
