import { expect } from "chai";

function sayHello(name: string) {
    return "Hello " + name + "!";
}

describe("Test Demo!", () => {
    it("should return 'Hello World!'", () => {
        expect(sayHello("World")).to.equal("Hello World!");
    });
});
