import { log, component } from "typespeed";
import { getMapping } from "typespeed-swagger";

@component
export default class FrontPage {

    @getMapping("/")
    public index(req, res) {
        log("Front page running.");
        res.send("Front page running.");
    }
}