#!/usr/bin/env node
"use strict";
import { createOnebots, App } from "./app.js";

const execArgv = process.argv.splice(2);
const obj: Record<string, string | string[]> = {};
for (let i = 0; i < execArgv.length; i += 2) {
    const key = execArgv[i];
    const value = execArgv[i + 1];
    if (!obj[key]) obj[key] = value;
    else {
        if (Array.isArray(obj[key])) obj[key].push(value);
        else obj[key] = [obj[key], value];
    }
}
if (obj["-r"]) {
    const adapters = [].concat(obj["-r"]);
    for (const adapter of adapters) {
        const result = await App.loadAdapterFactory(adapter);
        if(!result) console.warn(`[onebots] Failed to load adapter ${adapter}, please check if the adapter is installed`);
    }
}
if (!obj['-p']) obj['-p'] = []
if (!Array.isArray(obj['-p'])) obj['-p'] = [obj['-p'] as string]
if (obj["-p"]) {
    const protocols = [].concat(obj["-p"]);
    for (const protocol of protocols) {
        await App.loadProtocolFactory(protocol);
    }
}
if (Array.isArray(obj['-c'])) obj['-c'] = obj['-c'][obj['-c'].length - 1]
createOnebots(obj["-c"] as string).start();
