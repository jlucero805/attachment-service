#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AttachmentStack } from '../lib/attachment-stack';

const app = new cdk.App();

new AttachmentStack(app, 'AttachmentStack', {
    disambiguator: "jblucero",
});
