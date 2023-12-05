import DataB from "./data-b.class";
import DataC from "./data-c.class";

export default class DataA {
	constructor(public paramANumber: number, public paramAString: string, public paramAObjB: DataB, public paramAObjC: DataC[]){}
}