import { Emitter, EventTypes } from ".";

interface TestEvents extends EventTypes {
  foo: (a: string, b: number) => void;
  bar: () => void;
}

const emitter = new Emitter<TestEvents>();

emitter.on("foo", (a, b) => console.log("foo 1", a, b));
emitter.on("bar", () => console.log("bar 1"));

emitter.prependListener("bar", () => console.log("bar 2"));

emitter.emit("foo", "a", 1);
emitter.emit("bar");

emitter.prependListener("foo", (a, b) => console.log("foo 2", a, b));

emitter.emit("foo", "b", 2);
emitter.emit("bar");
