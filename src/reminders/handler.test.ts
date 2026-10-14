/** Purpose: Execute actual inline CloudFormation handler with a fake AWS client.
 * Verifies stale/cancelled delivery condition; no cloud calls. */
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {expect,it} from 'vitest';
it('conditions due delivery on the exact current scheduled timestamp',async()=>{
 const yaml=readFileSync('infra/reminders.yaml','utf8');
 const code=yaml.split('        ZipFile: |\n')[1].split('\n  SchedulerGroup:')[0].split('\n').map(line=>line.slice(10)).join('\n');
 let command: {ConditionExpression:string; ExpressionAttributeValues:Record<string,unknown>} | undefined;
 const exports: {handler?: (e:unknown)=>Promise<unknown>}={};
 class Client {async send(input: typeof command){command=input;return {};}}
 class Command {constructor(input:unknown){return input as Command;}}
 runInNewContext(code,{require:()=>({DynamoDBClient:Client,UpdateItemCommand:Command}),exports,console,process:{env:{CASES_TABLE:'fictional'}}});
 await exports.handler!({caseId:'fictional',scheduledAt:'2026-11-12T00:00:00.000Z'});
 expect(command?.ConditionExpression).toContain('reminderScheduledAt = :scheduledAt');
 expect(command?.ExpressionAttributeValues[':scheduledAt']).toEqual({S:'2026-11-12T00:00:00.000Z'});
});
