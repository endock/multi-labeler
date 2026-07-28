import { GitHub } from '@actions/github/lib/utils';
import { Config, Except, Label } from './config';

import { uniq, concat, difference, omit } from 'lodash';
import title from './matcher/title';
import body from './matcher/body';
import comment from './matcher/comment';
import branch from './matcher/branch';
import baseBranch from './matcher/base-branch';
import commits from './matcher/commits';
import files from './matcher/files';
import author from './matcher/author';
import * as github from '@actions/github';

/**
 * @param {string[]} labels that are newly derived
 * @param {Config} config of the labels
 */
export function mergeLabels(labels: string[], config: Config): string[] {
  const context = github.context;
  const payload = context.payload.pull_request || context.payload.issue;

  const currents = (payload?.labels?.map((label: any) => label.name as string) as string[]) || [];

  const removals = (config.labels || [])
    .filter((label) => {
      // Is sync, not matched and currently added as a label in payload
      return label.sync && !labels.includes(label.label) && currents.includes(label.label);
    })
    .map((value) => value.label);

  return difference(uniq(concat(labels, currents)), removals);
}

function exceptLabels(except: Label['except']): string[] {
  if (!except) {
    return [];
  }

  return Array.isArray(except) ? except : except.labels || [];
}

/**
 * @param {string[]} labels that matched
 * @param {string[]} excepted labels whose except matcher matched
 * @param {Config} config of the labels
 */
export function excludeLabels(labels: string[], excepted: string[], config: Config): string[] {
  const matched = new Set(labels);
  const dropped = new Set(excepted);

  // except.labels looks at the matched set only, so two labels excluding each other cancel out.
  return labels.filter((label) => {
    if (dropped.has(label)) {
      return false;
    }

    return !(config.labels || [])
      .filter((value) => value.label === label)
      .flatMap((value) => exceptLabels(value.except))
      .some((other) => matched.has(other));
  });
}

/**
 * Config view where each except takes the place of its matcher, so the matchers can run against it unchanged.
 */
function exceptConfig(config: Config): Config {
  return {
    ...config,
    labels: (config.labels || [])
      .filter((value) => value.except && !Array.isArray(value.except))
      .map((value) => {
        return { label: value.label, matcher: omit(value.except as Except, 'labels') };
      }),
  };
}

async function match(client: InstanceType<typeof GitHub>, config: Config): Promise<string[]> {
  const labels = await Promise.all([
    title(client, config),
    body(client, config),
    comment(client, config),
    branch(client, config),
    baseBranch(client, config),
    commits(client, config),
    files(client, config),
    author(client, config),
  ]);

  return uniq(concat(...labels));
}

export async function labels(client: InstanceType<typeof GitHub>, config: Config): Promise<string[]> {
  if (!config.labels?.length) {
    return [];
  }

  const [matched, excepted] = await Promise.all([match(client, config), match(client, exceptConfig(config))]);

  return mergeLabels(excludeLabels(matched, excepted, config), config);
}
