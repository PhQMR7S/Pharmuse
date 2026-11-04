import {test} from 'node:test';
import assert from 'node:assert/strict';
import {V11_ACCEPTANCE_PENDING,canStartV12} from '../lib/engine/release';
test('V1.2 stays blocked until every V1.1 acceptance gate passes',()=>{assert.equal(canStartV12(V11_ACCEPTANCE_PENDING),false);const passed=Object.fromEntries(Object.keys(V11_ACCEPTANCE_PENDING).map(k=>[k,true])) as typeof V11_ACCEPTANCE_PENDING;assert.equal(canStartV12(passed),true);for(const key of Object.keys(passed)){assert.equal(canStartV12({...passed,[key]:false}),false)}});
